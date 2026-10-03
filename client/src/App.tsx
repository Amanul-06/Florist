import React, { useState } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { DailyBusiness } from './pages/DailyBusiness';
import { Projects } from './pages/Projects';
import { FlowerCatalog } from './pages/FlowerCatalog';
import { Labourers } from './pages/Labourers';
import { Reports } from './pages/Reports';

import { DailyModal } from './components/DailyModal';
import { ProjectModal } from './components/ProjectModal';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { FlowerModal } from './components/FlowerModal';
import { LabourModal } from './components/LabourModal';

import { DailyRecord, Project, Flower, Labourer } from './types';
import { getProjectById } from './api';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [selectedDailyRecord, setSelectedDailyRecord] = useState<DailyRecord | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [activeProjectDetail, setActiveProjectDetail] = useState<Project | null>(null);

  const [isFlowerModalOpen, setIsFlowerModalOpen] = useState(false);
  const [selectedFlowerForEdit, setSelectedFlowerForEdit] = useState<Flower | null>(null);

  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [selectedLabourerForEdit, setSelectedLabourerForEdit] = useState<Labourer | null>(null);

  // Key to force refresh child pages after changes
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Handler to open project detail with fully populated line items
  const handleSelectProject = async (project: Project) => {
    try {
      const fullProject = await getProjectById(project.id);
      setActiveProjectDetail(fullProject);
      setIsProjectDetailOpen(true);
    } catch (e) {
      setActiveProjectDetail(project);
      setIsProjectDetailOpen(true);
    }
  };

  const handleEditProjectFromDetail = async (project: Project) => {
    try {
      const fullProject = await getProjectById(project.id);
      setSelectedProjectForEdit(fullProject);
      setIsProjectModalOpen(true);
    } catch (e) {
      setSelectedProjectForEdit(project);
      setIsProjectModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDailyModal={() => {
          setSelectedDailyRecord(null);
          setIsDailyModalOpen(true);
        }}
        onOpenProjectModal={() => {
          setSelectedProjectForEdit(null);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            key={refreshKey}
            onOpenDailyModal={() => {
              setSelectedDailyRecord(null);
              setIsDailyModalOpen(true);
            }}
            onOpenProjectModal={() => {
              setSelectedProjectForEdit(null);
              setIsProjectModalOpen(true);
            }}
            onSelectProject={handleSelectProject}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'daily' && (
          <DailyBusiness
            key={refreshKey}
            onOpenDailyModal={(record) => {
              setSelectedDailyRecord(record || null);
              setIsDailyModalOpen(true);
            }}
          />
        )}

        {activeTab === 'projects' && (
          <Projects
            key={refreshKey}
            onOpenProjectModal={(project) => {
              setSelectedProjectForEdit(project || null);
              setIsProjectModalOpen(true);
            }}
            onSelectProject={handleSelectProject}
          />
        )}

        {activeTab === 'flowers' && (
          <FlowerCatalog
            key={refreshKey}
            onOpenFlowerModal={(flower) => {
              setSelectedFlowerForEdit(flower || null);
              setIsFlowerModalOpen(true);
            }}
          />
        )}

        {activeTab === 'labourers' && (
          <Labourers
            key={refreshKey}
            onOpenLabourModal={(labourer) => {
              setSelectedLabourerForEdit(labourer || null);
              setIsLabourModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && <Reports key={refreshKey} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500 no-print">
        <p>🌸 Florist Shop Management System · Internal Business Administration</p>
      </footer>

      {/* Global Modals */}
      <DailyModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        onSaved={triggerRefresh}
        initialRecord={selectedDailyRecord}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSaved={triggerRefresh}
        initialProject={selectedProjectForEdit}
      />

      <ProjectDetailDrawer
        isOpen={isProjectDetailOpen}
        onClose={() => setIsProjectDetailOpen(false)}
        project={activeProjectDetail}
        onEdit={handleEditProjectFromDetail}
        onDelete={() => triggerRefresh()}
      />

      <FlowerModal
        isOpen={isFlowerModalOpen}
        onClose={() => setIsFlowerModalOpen(false)}
        onSaved={triggerRefresh}
        initialFlower={selectedFlowerForEdit}
      />

      <LabourModal
        isOpen={isLabourModalOpen}
        onClose={() => setIsLabourModalOpen(false)}
        onSaved={triggerRefresh}
        initialLabourer={selectedLabourerForEdit}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
};

export default App;
