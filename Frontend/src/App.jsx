import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import DatasetList from './pages/DatasetList';
import DatasetDetail from './pages/DatasetDetail';
import DatasetUpload from './pages/DatasetUpload';
import VersionComparison from './pages/VersionComparison';
import ExperimentList from './pages/ExperimentList';
import ExperimentDetail from './pages/ExperimentDetail';
import NewExperiment from './pages/NewExperiment';
import Results from './pages/Results';
import Lineage from './pages/Lineage';
import Copilot from './pages/Copilot';
import Tracking from './pages/Tracking';
import Settings from './pages/Settings';
import ProjectsList from './pages/ProjectsList';
import CreateProject from './pages/CreateProject';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Automatically redirect authenticated users to home, or unauthenticated users to landing
  useEffect(() => {
    if (loading) return;

    if (user) {
      if (page === 'landing' || page === 'login' || page === 'signup') {
        setPage('home');
      }
    } else {
      if (page !== 'login' && page !== 'signup') {
        setPage('landing');
      }
    }
  }, [user, loading, page]);

  const [datasetsView, setDatasetsView] = useState('list');
  const [selectedDatasetId, setSelectedDatasetId] = useState('');

  const [experimentsView, setExperimentsView] = useState('list');
  const [selectedExpId, setSelectedExpId] = useState('');

  const [projectsView, setProjectsView] = useState('list');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  function navigate(p) {
    setPage(p);

    if (p === 'datasets') {
      setDatasetsView('list');
    }

    if (p === 'experiments') {
      setExperimentsView('list');
    }

    if (p === 'projects') {
      setProjectsView('list');
    }
  }

  // Dataset navigation
  function openDataset(id) {
    setSelectedDatasetId(id);
    setDatasetsView('detail');
    setPage('datasets');
  }

  function openUpload() {
    setDatasetsView('upload');
  }

  function openCompare(id) {
    setSelectedDatasetId(id);
    setDatasetsView('compare');
  }

  // Experiment navigation
  function openExperiment(id) {
    setSelectedExpId(id);
    setExperimentsView('detail');
    setPage('experiments');
  }

  function openNewExperiment() {
    setExperimentsView('new');
  }

  // Cross-module navigation
  function viewDatasetFromExp(datasetId) {
    openDataset(datasetId);
  }

  function viewLineage() {
    setPage('lineage');
  }

  const topBarMeta = {
    home: {
      title: 'Dashboard',
      subtitle: 'Overview of your research workspace',
    },

    datasets: {
      title: 'Datasets',
      subtitle: 'Manage data sources and versions',
    },

    'datasets-detail': {
      title: 'Dataset Details',
      subtitle: 'Quality, versions, and schema',
    },

    'datasets-upload': {
      title: 'Upload Dataset',
      subtitle: 'Add a new data source',
    },

    'datasets-compare': {
      title: 'Compare Versions',
      subtitle: 'Side-by-side version diff',
    },

    experiments: {
      title: 'Experiments',
      subtitle: 'Track ML training runs',
    },

    'experiments-detail': {
      title: 'Experiment Details',
      subtitle: 'Metrics, curves, and analysis',
    },

    'experiments-new': {
      title: 'New Experiment',
      subtitle: 'Configure and launch a training run',
    },

    lineage: {
      title: 'Lineage',
      subtitle: 'Research provenance graph',
    },

    results: {
      title: 'Results',
      subtitle: 'Model comparison and benchmarks',
    },

    copilot: {
      title: 'Research Copilot',
      subtitle: 'AI-powered assistant',
    },

    tracking: {
      title: 'Tracking SDK',
      subtitle: 'Monitor data lineage and experiment sessions',
    },

    projects: {
      title: 'Projects',
      subtitle: 'Research project management',
    },

    'projects-create': {
      title: 'Create Project',
      subtitle: 'Set up a new collaborative workspace',
    },

    'projects-workspace': {
      title: 'Project Workspace',
      subtitle: 'Shared research environment',
    },

    settings: {
      title: 'Settings',
      subtitle: 'Workspace configuration',
    },
  };

  let metaKey = page;

  if (page === 'datasets') {
    metaKey =
      datasetsView !== 'list'
        ? `datasets-${datasetsView}`
        : 'datasets';
  }

  if (page === 'experiments') {
    metaKey =
      experimentsView !== 'list'
        ? `experiments-${experimentsView}`
        : 'experiments';
  }

  if (page === 'projects') {
    metaKey =
      projectsView !== 'list'
        ? `projects-${projectsView}`
        : 'projects';
  }

  const meta = topBarMeta[metaKey] || topBarMeta[page];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F9FC',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#0D9488',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (page === 'landing') {
    return (
      <Landing
        onGetStarted={() => navigate('signup')}
        onLogin={() => navigate('login')}
      />
    );
  }

  if (page === 'login') {
    return (
      <Login
        onSuccess={() => navigate('home')}
        onSignup={() => navigate('signup')}
        onBack={() => navigate('landing')}
      />
    );
  }

  if (page === 'signup') {
    return (
      <Signup
        onSuccess={() => navigate('home')}
        onLogin={() => navigate('login')}
        onBack={() => navigate('landing')}
      />
    );
  }

  return (
    <div className="app-layout flex h-screen overflow-hidden bg-[#F7F9FC]">
      <Sidebar
        activePage={page}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <div className="app-main-column flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        <main className="app-main-content flex-1 overflow-y-auto">

          {/* Home */}
          {page === 'home' && (
            <Home onNavigate={navigate} />
          )}

          {/* Datasets */}
          {page === 'datasets' && datasetsView === 'list' && (
            <DatasetList
              onSelect={openDataset}
              onUpload={openUpload}
            />
          )}

          {page === 'datasets' &&
            datasetsView === 'detail' &&
            selectedDatasetId && (
              <DatasetDetail
                datasetId={selectedDatasetId}
                onBack={() => setDatasetsView('list')}
                onCompare={openCompare}
              />
            )}

          {page === 'datasets' && datasetsView === 'upload' && (
            <DatasetUpload
              onBack={() => setDatasetsView('list')}
              onSuccess={() => setDatasetsView('list')}
            />
          )}

          {page === 'datasets' &&
            datasetsView === 'compare' &&
            selectedDatasetId && (
              <VersionComparison
                datasetId={selectedDatasetId}
                onBack={() => setDatasetsView('detail')}
              />
            )}

          {/* Experiments */}
          {page === 'experiments' &&
            experimentsView === 'list' && (
              <ExperimentList
                onSelect={openExperiment}
                onNew={openNewExperiment}
                onViewDataset={viewDatasetFromExp}
              />
            )}

          {page === 'experiments' &&
            experimentsView === 'detail' &&
            selectedExpId && (
              <ExperimentDetail
                experimentId={selectedExpId}
                onBack={() => setExperimentsView('list')}
                onViewDataset={viewDatasetFromExp}
                onViewLineage={viewLineage}
              />
            )}

          {page === 'experiments' &&
            experimentsView === 'new' && (
              <NewExperiment
                onBack={() => setExperimentsView('list')}
                onSuccess={() => setExperimentsView('list')}
              />
            )}

          {/* Results */}
          {page === 'results' && (
            <Results
              onViewExperiment={openExperiment}
              onViewDataset={viewDatasetFromExp}
              onViewLineage={viewLineage}
            />
          )}

          {/* Other pages */}
          {page === 'lineage' && <Lineage />}

          {page === 'copilot' && <Copilot />}

          {page === 'tracking' && <Tracking />}

          {/* Projects */}
          {page === 'projects' &&
            projectsView === 'list' && (
              <ProjectsList
                onOpen={(id) => {
                  setSelectedProjectId(id);
                  setProjectsView('workspace');
                }}
                onCreate={() => setProjectsView('create')}
              />
            )}

          {page === 'projects' &&
            projectsView === 'create' && (
              <CreateProject
                onBack={() => setProjectsView('list')}
                onCreate={(id) => {
                  setSelectedProjectId(id);
                  setProjectsView('workspace');
                }}
              />
            )}

          {page === 'projects' &&
            projectsView === 'workspace' &&
            selectedProjectId && (
              <ProjectWorkspace
                projectId={selectedProjectId}
                onBack={() => setProjectsView('list')}
              />
            )}

          {/* Settings */}
          {page === 'settings' && <Settings />}

        </main>
      </div>
    </div>
  );
}
