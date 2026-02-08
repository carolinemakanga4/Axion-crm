import { useState } from 'react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes';
import { useAuth } from '../contexts/AuthContext';
import { Note } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/Loading';
import { NoteForm } from '../features/notes/NoteForm';
import { Plus, StickyNote, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const Notes = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const { data: notes, isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const handleCreate = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (
    data: Omit<Note, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>
  ) => {
    if (selectedNote) {
      await updateNote.mutateAsync({ id: selectedNote.id, ...data });
    } else {
      await createNote.mutateAsync({
        ...data,
        org_id: user?.profile?.org_id || '',
        created_by: user?.id || '',
      });
    }
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedNote) {
      await deleteNote.mutateAsync(selectedNote.id);
      setIsDeleteDialogOpen(false);
      setSelectedNote(null);
    }
  };

  const canEdit = (note: Note) => {
    return user?.profile?.role === 'admin' || note.created_by === user?.id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="mt-1 text-sm text-gray-500">Track communication and important information</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !notes || notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes found"
          description="Get started by creating your first note."
          action={{ label: 'Add Note', onClick: handleCreate }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note: any) => {
            const canEditNote = canEdit(note);
            return (
              <div key={note.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <span>{format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      {note.profiles && (
                        <span>By {note.profiles.full_name || note.profiles.email}</span>
                      )}
                      {note.client_id && <span>• Client Note</span>}
                      {note.project_id && <span>• Project Note</span>}
                      {note.invoice_id && <span>• Invoice Note</span>}
                    </div>
                  </div>
                  {canEditNote && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        aria-label="Edit note"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNote(null);
        }}
        title={selectedNote ? 'Edit Note' : 'Add New Note'}
        size="lg"
      >
        <NoteForm
          note={selectedNote || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedNote(null);
          }}
          isLoading={createNote.isPending || updateNote.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedNote(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete this note? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};
