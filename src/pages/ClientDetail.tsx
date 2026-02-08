import { useParams, Link } from 'react-router-dom';
import { useClient } from '../hooks/useClients';
import { useProjects } from '../hooks/useProjects';
import { useInvoices } from '../hooks/useInvoices';
import { useNotes } from '../hooks/useNotes';
import { LoadingSpinner } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, Building, MapPin, FileText, FolderKanban, StickyNote } from 'lucide-react';

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading: clientLoading } = useClient(id || '');
  const { data: projects } = useProjects(id);
  const { data: invoices } = useInvoices(id);
  const { data: notes } = useNotes(id);

  if (clientLoading) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <Link to="/clients" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Clients
      </Link>

      {/* Client Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{client.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {client.phone}
            </div>
          )}
          {client.company && (
            <div className="flex items-center text-sm text-gray-600">
              <Building className="w-4 h-4 mr-2 text-gray-400" />
              {client.company}
            </div>
          )}
          {client.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {client.address}
            </div>
          )}
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FolderKanban className="w-5 h-5 mr-2" />
            Projects ({projects?.length || 0})
          </h2>
        </div>
        {projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects"
            description="This client doesn't have any projects yet."
          />
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Invoices ({invoices?.length || 0})
          </h2>
        </div>
        {invoices && invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice: any) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{invoice.invoice_number}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(invoice.issue_date), 'MMM dd, yyyy')} • Due:{' '}
                      {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${invoice.total.toLocaleString()}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No invoices"
            description="This client doesn't have any invoices yet."
          />
        )}
      </div>

      {/* Notes */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <StickyNote className="w-5 h-5 mr-2" />
            Notes ({notes?.length || 0})
          </h2>
        </div>
        {notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note: any) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{note.content}</p>
                {note.profiles && (
                  <p className="text-xs text-gray-500 mt-2">
                    By {note.profiles.full_name || note.profiles.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={StickyNote}
            title="No notes"
            description="No notes have been added for this client yet."
          />
        )}
      </div>
    </div>
  );
};
