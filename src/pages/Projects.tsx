import { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/Loading';
import { ProjectForm } from '../features/projects/ProjectForm';
import { Plus, FolderKanban, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const Projects = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useProjects(undefined, searchQuery);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const handleCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Project, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
    if (selectedProject) {
      await updateProject.mutateAsync({ id: selectedProject.id, ...data });
    } else {
      await createProject.mutateAsync({
        ...data,
        org_id: user?.profile?.org_id || '',
      });
    }
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedProject) {
      await deleteProject.mutateAsync(selectedProject.id);
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const isAdmin = user?.profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your projects and track progress</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Projects List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first project.'}
          action={isAdmin ? { label: 'Add Project', onClick: handleCreate } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project: any) => (
            <div key={project.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Client: {project.clients?.name}</p>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {project.start_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Start: {format(new Date(project.start_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {project.budget && (
                      <div className="text-xs text-gray-500">
                        Budget: ${project.budget.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'on_hold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        aria-label="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        title={selectedProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
      >
        <ProjectForm
          project={selectedProject || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          isLoading={createProject.isPending || updateProject.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete ${selectedProject?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};
