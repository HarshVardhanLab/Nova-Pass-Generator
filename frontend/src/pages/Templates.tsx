import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { templates } from '../services/api';

export default function Templates() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    event_id: '',
    name: '',
    file: null as File | null,
  });

  const { data: templatesList } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templates.list();
      return response.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => templates.upload(formData),
    onSuccess: () => {
      toast.success('Template uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowUpload(false);
      setUploadData({ event_id: '', name: '', file: null });
    },
    onError: () => {
      toast.error('Upload failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => templates.delete(id),
    onSuccess: () => {
      toast.success('Template deleted!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.file || !uploadData.event_id || !uploadData.name) {
      toast.error('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('event_id', uploadData.event_id);
    formData.append('name', uploadData.name);
    
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Templates</h1>
          <p className="text-gray-400 mt-1">Manage PDF pass templates</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Upload size={20} />
          Upload Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatesList?.map((template: any) => (
          <div
            key={template.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{template.name}</h3>
                  {template.is_default && (
                    <span className="text-xs text-green-400">Default</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this template?')) {
                    deleteMutation.mutate(template.id);
                  }
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>QR Position: ({template.qr_x}, {template.qr_y})</p>
              <p>QR Size: {template.qr_size}px</p>
              {template.text_elements ? (
                <p>Text Elements: {JSON.parse(template.text_elements).length} fields</p>
              ) : (
                <p>Text Position: ({template.text_x}, {template.text_y})</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Template</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event ID *
                </label>
                <input
                  type="number"
                  value={uploadData.event_id}
                  onChange={(e) => setUploadData({ ...uploadData, event_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PDF File *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
