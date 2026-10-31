import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Vehicle, VehicleType, getITVStatus } from './types/vehicle';
import {
  getFleet,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  renewVehicleITV,
  resetFleetToDefault,
  saveFleet
} from './services/storage';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { VehicleCard } from './components/VehicleCard';
import { VehicleTableView } from './components/VehicleTableView';
import { VehicleModal } from './components/VehicleModal';
import { RenewModal } from './components/RenewModal';
import { ITVScanner } from './components/ITVScanner';
import { PredictivePanel } from './components/PredictivePanel';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationModal } from './components/NotificationModal';
import { getNotificationStatus, checkAndNotifyExpiringVehicles } from './services/notifications';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Car,
  Bike,
  Plus,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileDown
} from 'lucide-react';

export default function App() {
  const [fleet, setFleet] = useState<Vehicle[]>(() => getFleet());
  const [activeTab, setActiveTab] = useState<'flota' | 'predictivo' | 'scanner'>('flota');
  const [currentFilter, setCurrentFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'coche' | 'moto'>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'urgencia' | 'matricula' | 'modelo'>('urgencia');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal states
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewingVehicle, setRenewingVehicle] = useState<Vehicle | null>(null);

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => getNotificationStatus().isEnabled
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep state synchronized with storage and run proactive notification check
  useEffect(() => {
    const currentFleet = getFleet();
    setFleet(currentFleet);
    setNotificationsEnabled(getNotificationStatus().isEnabled);

    // Automatic check for expiring vehicles
    checkAndNotifyExpiringVehicles(currentFleet);
  }, []);

  // Summary counts for badges
  const counts = useMemo(() => {
    return fleet.reduce(
      (acc, v) => {
        const info = getITVStatus(v.fechaCaducidadITV);
        if (info.status === 'caducada') acc.expired++;
        if (info.status === 'urgente') acc.urgent++;
        return acc;
      },
      { expired: 0, urgent: 0 }
    );
  }, [fleet]);

  // Filtered & Sorted Fleet
  const filteredFleet = useMemo(() => {
    return fleet.filter((v) => {
      // Type filter
      if (typeFilter !== 'todos' && v.tipo !== typeFilter) {
        return false;
      }

      // Status filter
      if (currentFilter !== 'todos') {
        const info = getITVStatus(v.fechaCaducidadITV);
        if (currentFilter === 'caducadas' && info.status !== 'caducada') return false;
        if (currentFilter === 'urgentes' && info.status !== 'urgente') return false;
        if (currentFilter === 'al_dia' && info.status !== 'al_dia') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const plate = v.matricula.toLowerCase();
        const brand = v.marca.toLowerCase();
        const model = v.modelo.toLowerCase();
        const internal = (v.numeroInterno || '').toLowerCase();
        return (
          plate.includes(q) ||
          brand.includes(q) ||
          model.includes(q) ||
          internal.includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgencia') {
        const aStatus = getITVStatus(a.fechaCaducidadITV);
        const bStatus = getITVStatus(b.fechaCaducidadITV);
        return aStatus.diasRestantes - bStatus.diasRestantes;
      }
      if (sortBy === 'matricula') {
        return a.matricula.localeCompare(b.matricula);
      }
      if (sortBy === 'modelo') {
        return `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`);
      }
      return 0;
    });
  }, [fleet, currentFilter, typeFilter, searchQuery, sortBy]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'>, id?: string) => {
    if (id) {
      updateVehicle(id, vehicleData);
      showToast(`Vehículo ${vehicleData.matricula} actualizado correctamente`);
    } else {
      addVehicle(vehicleData);
      showToast(`Vehículo ${vehicleData.matricula} añadido a la flota`);
    }
    setFleet(getFleet());
  };

  const handleDeleteVehicle = (id: string) => {
    const v = fleet.find((item) => item.id === id);
    deleteVehicle(id);
    setFleet(getFleet());
    showToast(`Vehículo ${v?.matricula || ''} eliminado`);
  };

  const handleOpenRenew = (id: string) => {
    const v = fleet.find((item) => item.id === id);
    if (v) {
      setRenewingVehicle(v);
      setIsRenewModalOpen(true);
    }
  };

  const handleConfirmRenew = (id: string, estacion: string, resultado: 'favorable' | 'favorable_con_leves') => {
    const updated = renewVehicleITV(id, estacion, resultado);
    if (updated) {
      setFleet(getFleet());
      showToast(`✅ ITV renovada para ${updated.matricula} hasta el ${updated.fechaCaducidadITV}`);
    }
  };

  const handleResetFleet = () => {
    resetFleetToDefault();
    setFleet(getFleet());
    showToast('Flota inicial restablecida con éxito');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fleet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autoescuela_flota_itv_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Copia de seguridad exportada');
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveFleet(parsed);
          setFleet(getFleet());
          showToast(`Se han importado ${parsed.length} vehículos`);
        } else {
          alert('El archivo no contiene un formato de flota válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleVehicleScanned = (vehicleData: Omit<Vehicle, 'id'>) => {
    addVehicle(vehicleData);
    setFleet(getFleet());
    setActiveTab('flota');
    showToast(`🎉 Vehículo ${vehicleData.matricula} extraído y añadido a la flota`);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Hidden file input for backup import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileImportChange}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewVehicleModal={handleOpenAddModal}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        notificationsEnabled={notificationsEnabled}
        onResetFleet={handleResetFleet}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        urgentCount={counts.urgent}
        expiredCount={counts.expired}
        totalCount={fleet.length}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xl border border-blue-400/30 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: FLEET DASHBOARD */}
        {activeTab === 'flota' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* KPI Stats & Alert System (Requirements 1 & 3) */}
            <StatsOverview
              fleet={fleet}
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
            />

            {/* Filter and Search Bar Controls */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por matrícula (ej. 4582 LKP), modelo, marca..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Type Filter Buttons: Todos, Coches, Motos */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setTypeFilter('todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      typeFilter === 'todos'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTypeFilter('coche')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      typeFilter === 'coche'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Coches</span>
                  </button>
                  <button
                    onClick={() => setTypeFilter('moto')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      typeFilter === 'moto'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Motos</span>
                  </button>
                </div>

                {/* Sort & View Mode Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Sort dropdown */}
                  <div className="relative flex items-center">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-7 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="urgencia">Ordenar: Más urgente</option>
                      <option value="matricula">Ordenar: Matrícula</option>
                      <option value="modelo">Ordenar: Modelo</option>
                    </select>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
                  </div>

                  {/* Cards / Table toggle */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'cards'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Vista en tarjetas"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'table'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Vista en tabla compacta"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Indicators */}
              {(currentFilter !== 'todos' || searchQuery) && (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>
                    Mostrando <strong>{filteredFleet.length}</strong> de <strong>{fleet.length}</strong> vehículos
                    {currentFilter !== 'todos' && ` (Filtro: ${currentFilter})`}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentFilter('todos');
                      setSearchQuery('');
                      setTypeFilter('todos');
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>

            {/* Fleet List Display */}
            {filteredFleet.length === 0 ? (
              <div className="text-center p-12 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <Car className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  No se encontraron vehículos
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No hay ningún vehículo en la flota que coincida con los criterios de búsqueda o filtro seleccionados.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentFilter('todos');
                      setSearchQuery('');
                      setTypeFilter('todos');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    Mostrar todos
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    + Añadir vehículo
                  </button>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFleet.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteVehicle}
                    onRenew={handleOpenRenew}
                    onViewPredictive={() => setActiveTab('predictivo')}
                  />
                ))}
              </div>
            ) : (
              <VehicleTableView
                fleet={filteredFleet}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
                onRenew={handleOpenRenew}
                onViewPredictive={() => setActiveTab('predictivo')}
              />
            )}
          </div>
        )}

        {/* TAB 2: PREDICTIVE APPOINTMENTS PANEL (Requirement 5) */}
        {activeTab === 'predictivo' && (
          <PredictivePanel
            fleet={fleet}
            onUpdateVehicle={(id, updates) => {
              updateVehicle(id, updates);
              setFleet(getFleet());
              showToast('Datos de cita previa actualizados');
            }}
            onRenewVehicle={(id) => handleOpenRenew(id)}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
          />
        )}

        {/* TAB 3: AI SCANNER FOR ITV TECHNICAL SHEET (Requirement 4) */}
        {activeTab === 'scanner' && (
          <ITVScanner
            onVehicleAdded={handleVehicleScanned}
            onCancel={() => setActiveTab('flota')}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile: Quick Add Vehicle */}
      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-5 right-5 sm:hidden z-30 p-4 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/50 hover:bg-blue-500 active:scale-95 transition-all"
        title="Añadir nuevo vehículo a la flota"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Vehicle Add/Edit Modal (Requirement 2) */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        initialVehicle={editingVehicle}
      />

      {/* Renewal Confirmation Modal */}
      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => {
          setIsRenewModalOpen(false);
          setRenewingVehicle(null);
        }}
        vehicle={renewingVehicle}
        onConfirm={handleConfirmRenew}
      />

      {/* Notification Preferences Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setNotificationsEnabled(getNotificationStatus().isEnabled);
        }}
        fleet={fleet}
      />

      {/* PWA Offline Connection Indicator */}
      <OfflineIndicator />
    </div>
  );
}
