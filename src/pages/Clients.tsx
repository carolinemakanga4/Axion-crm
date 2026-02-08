import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClients';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/Loading';
import { ClientForm } from '../features/clients/ClientForm';
import { Plus, Users, Edit, Trash2, Mail, Phone, Building } from 'lucide-react';

export const Clients = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients(searchQuery);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Client, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
    if (selectedClient) {
      await updateClient.mutateAsync({ id: selectedClient.id, ...data });
    } else {
      await createClient.mutateAsync({
        ...data,
        org_id: user?.profile?.org_id || '',
      });
    }
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedClient) {
      await deleteClient.mutateAsync(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const isAdmin = user?.profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your client relationships</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Clients List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !clients || clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description={searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first client.'}
          action={isAdmin ? { label: "Add Client", onClick: handleCreate } : undefined}


        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/clients/${client.id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                      {client.name}
                    </h3>
                  </Link>
                  {client.company && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Building className="w-4 h-4 mr-1" />
                      {client.company}
                    </div>
                  )}
                  {client.email && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-1" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-1" />
                      {client.phone}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      aria-label="Edit client"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
          setSelectedClient(null);
        }}
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
        size="lg"
      >
        <ClientForm
          client={selectedClient || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          isLoading={createClient.isPending || updateClient.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message={`Are you sure you want to delete ${selectedClient?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};
