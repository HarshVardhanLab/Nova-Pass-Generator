import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Download } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import toast from 'react-hot-toast';
import { csv, members } from '../services/api';

export default function CSVManager() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  // Fetch members
  const { data: membersData } = useQuery({
    queryKey: ['members', eventId],
    queryFn: async () => {
      const response = await members.list(undefined, Number(eventId));
      return response.data;
    },
    enabled: !!eventId,
  });

  // Upload CSV mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => csv.upload(Number(eventId), file),
    onSuccess: () => {
      toast.success('CSV uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  // Column definitions
  const columnDefs = [
    { 
      field: 'team.team_id', 
      headerName: 'Team ID', 
      editable: false,
      valueGetter: (params: any) => params.data?.team?.team_id 
    },
    { 
      field: 'team.team_name', 
      headerName: 'Team Name', 
      editable: false,
      valueGetter: (params: any) => params.data?.team?.team_name 
    },
    { field: 'name', headerName: 'Name', editable: true },
    { field: 'email', headerName: 'Email', editable: true },
    { 
      field: 'status', 
      headerName: 'Status', 
      editable: true, 
      cellEditor: 'agSelectCellEditor', 
      cellEditorParams: { values: ['LEADER', 'MEMBER'] } 
    },
    { 
      field: 'is_checked_in', 
      headerName: 'Checked In', 
      editable: false, 
      cellRenderer: (params: any) => params.value ? '✅' : '❌' 
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleExport = async () => {
    try {
      const response = await csv.export(Number(eventId));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CSV Manager</h1>
          <p className="text-gray-400 mt-1">Upload CSV or edit data inline</p>
        </div>

        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
            <Upload size={20} />
            <span>Upload CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="ag-theme-alpine-dark" style={{ height: 600, width: '100%' }}>
          <AgGridReact
            rowData={membersData || []}
            columnDefs={columnDefs}
            defaultColDef={{
              flex: 1,
              minWidth: 150,
              filter: true,
              sortable: true,
              resizable: true,
            }}
            pagination={true}
            paginationPageSize={20}
            onCellValueChanged={(params) => {
              // Update member
              members.update(params.data.id, {
                name: params.data.name,
                email: params.data.email,
                status: params.data.status,
              }).then(() => {
                toast.success('Member updated!');
              }).catch(() => {
                toast.error('Update failed');
              });
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">📋 CSV Format</h3>
        <p className="text-gray-400 mb-2">Your CSV file should have these columns:</p>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li>Team Id</li>
          <li>Team Name</li>
          <li>Name</li>
          <li>Status (Leader or Member)</li>
          <li>Email</li>
        </ul>
      </div>
    </div>
  );
}
