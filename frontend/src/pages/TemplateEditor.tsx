import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Save, Upload, ArrowLeft, Plus, Trash2, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { templates } from '../services/api';

interface TextElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: string;
  field: string; // 'name', 'team_name', 'team_id', 'status', 'email', 'custom'
}

export default function TemplateEditor() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  // QR Position
  const [qrPosition, setQrPosition] = useState({ x: 50, y: 50 });
  const [qrSize, setQrSize] = useState(100);
  
  // Text Elements
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: '1',
      x: 300,
      y: 100,
      width: 200,
      height: 30,
      text: 'Name',
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'left',
      field: 'name'
    }
  ]);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDraggingQR, setIsDraggingQR] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 595, height: 842 });

  // Load PDF preview
  useEffect(() => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfPreview(e.target?.result as string);
      };
      reader.readAsDataURL(pdfFile);
    }
  }, [pdfFile]);

  // Redraw canvas when anything changes
  useEffect(() => {
    if (pdfPreview) {
      drawCanvas();
    }
  }, [qrPosition, qrSize, textElements, pdfPreview, selectedElement]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      setCanvasSize({ width: img.width, height: img.height });

      // Draw PDF
      ctx.drawImage(img, 0, 0);

      // Draw QR placeholder
      ctx.strokeStyle = selectedElement === 'qr' ? '#22c55e' : '#10b981';
      ctx.lineWidth = selectedElement === 'qr' ? 4 : 2;
      ctx.strokeRect(qrPosition.x, qrPosition.y, qrSize, qrSize);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(qrPosition.x, qrPosition.y, qrSize, qrSize);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('QR', qrPosition.x + qrSize/2 - 10, qrPosition.y + qrSize/2);

      // Draw text elements
      textElements.forEach(element => {
        const isSelected = selectedElement === element.id;
        
        // Draw box
        ctx.strokeStyle = isSelected ? '#3b82f6' : '#6b7280';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Draw text preview
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
        ctx.textAlign = element.textAlign as CanvasTextAlign;
        
        let textX = element.x + 5;
        if (element.textAlign === 'center') textX = element.x + element.width / 2;
        if (element.textAlign === 'right') textX = element.x + element.width - 5;
        
        ctx.fillText(element.text, textX, element.y + element.height / 2 + element.fontSize / 3);
        
        // Draw label
        ctx.fillStyle = '#3b82f6';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`{${element.field}}`, element.x + 2, element.y - 2);
      });
    };
    img.src = pdfPreview!;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check QR
    if (x >= qrPosition.x && x <= qrPosition.x + qrSize &&
        y >= qrPosition.y && y <= qrPosition.y + qrSize) {
      setIsDraggingQR(true);
      setSelectedElement('qr');
      return;
    }

    // Check text elements
    for (const element of textElements) {
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        setIsDraggingElement(element.id);
        setSelectedElement(element.id);
        return;
      }
    }

    setSelectedElement(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingQR) {
      setQrPosition({
        x: Math.max(0, Math.min(x - qrSize / 2, canvasSize.width - qrSize)),
        y: Math.max(0, Math.min(y - qrSize / 2, canvasSize.height - qrSize)),
      });
    } else if (isDraggingElement) {
      setTextElements(prev => prev.map(el => 
        el.id === isDraggingElement
          ? {
              ...el,
              x: Math.max(0, Math.min(x - el.width / 2, canvasSize.width - el.width)),
              y: Math.max(0, Math.min(y - el.height / 2, canvasSize.height - el.height))
            }
          : el
      ));
    }

    // Cursor
    const isOverQR = x >= qrPosition.x && x <= qrPosition.x + qrSize &&
                     y >= qrPosition.y && y <= qrPosition.y + qrSize;
    const isOverElement = textElements.some(el =>
      x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
    );
    canvas.style.cursor = isOverQR || isOverElement ? 'move' : 'default';
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingQR(false);
    setIsDraggingElement(null);
  };

  const addTextElement = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      text: 'New Text',
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#ffffff',
      fontWeight: 'normal',
      textAlign: 'left',
      field: 'custom'
    };
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const deleteTextElement = (id: string) => {
    setTextElements(textElements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const selectedTextElement = textElements.find(el => el.id === selectedElement);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!pdfFile || !templateName) {
        throw new Error('Missing required fields');
      }

      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('event_id', eventId || '');
      formData.append('name', templateName);
      formData.append('qr_x', Math.round(qrPosition.x).toString());
      formData.append('qr_y', Math.round(qrPosition.y).toString());
      formData.append('qr_size', qrSize.toString());
      formData.append('text_x', '0');
      formData.append('text_y', '0');
      formData.append('is_default', isDefault.toString());
      formData.append('text_elements', JSON.stringify(textElements));

      return templates.upload(formData);
    },
    onSuccess: () => {
      toast.success('Template created successfully!');
      navigate(`/events/${eventId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  const handleSave = () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (!templateName) {
      toast.error('Please enter a template name');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Template Editor</h1>
            <p className="text-gray-400 mt-1">Design your pass template like Canva</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!pdfFile || !templateName || uploadMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          Save Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Settings */}
        <div className="space-y-4">
          {/* Upload PDF */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">📄 PDF Template</h3>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
              <Upload className="text-gray-400 mb-1" size={24} />
              <span className="text-gray-400 text-xs text-center px-2">
                {pdfFile ? pdfFile.name : 'Upload PDF'}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Template Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">ℹ️ Info</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300 text-sm">Default</span>
              </label>
            </div>
          </div>

          {/* QR Settings */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">📱 QR Code</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Size: {qrSize}px</label>
              <input
                type="range"
                min="50"
                max="200"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                ({Math.round(qrPosition.x)}, {Math.round(qrPosition.y)})
              </p>
            </div>
          </div>

          {/* Add Text Button */}
          <button
            onClick={addTextElement}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Add Text Field
          </button>
        </div>

        {/* Middle Panel - Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">🎨 Canvas</h3>
            
            {pdfFile ? (
              <div className="bg-gray-900 rounded-lg p-2 overflow-auto max-h-[700px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="max-w-full h-auto border border-gray-700 rounded cursor-crosshair"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-600 mb-3" size={40} />
                  <p className="text-gray-500 text-sm">Upload PDF to start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Text Element Editor */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">✏️ Text Elements</h3>
            
            {textElements.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No text elements yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {textElements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElement(el.id)}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedElement === el.id
                        ? 'bg-blue-500/20 border border-blue-500'
                        : 'bg-gray-700 border border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Type size={14} className="text-gray-400" />
                      <span className="text-white text-sm">{el.text}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextElement(el.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Editor */}
          {selectedTextElement && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
              <h3 className="text-lg font-bold text-white mb-2">🎨 Edit Text</h3>
              
              {/* Field Type */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Data Field</label>
                <select
                  value={selectedTextElement.field}
                  onChange={(e) => updateTextElement(selectedTextElement.id, { field: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="name">Name</option>
                  <option value="team_name">Team Name</option>
                  <option value="team_id">Team ID</option>
                  <option value="status">Status</option>
                  <option value="email">Email</option>
                  <option value="custom">Custom Text</option>
                </select>
              </div>

              {/* Custom Text */}
              {selectedTextElement.field === 'custom' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text (use {'{Name}'}, {'{Team Name}'}, {'{Team ID}'}, {'{Status}'}, {'{Email}'})</label>
                  <textarea
                    value={selectedTextElement.text}
                    onChange={(e) => updateTextElement(selectedTextElement.id, { text: e.target.value })}
                    placeholder="e.g., Welcome {Name} from {Team Name}"
                    rows={3}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use placeholders for dynamic data</p>
                </div>
              )}

              {/* Font Size */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Size: {selectedTextElement.fontSize}px</label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={selectedTextElement.fontSize}
                  onChange={(e) => updateTextElement(selectedTextElement.id, { fontSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Font</label>
                <select
                  value={selectedTextElement.fontFamily}
                  onChange={(e) => updateTextElement(selectedTextElement.id, { fontFamily: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              {/* Font Weight */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Weight</label>
                <select
                  value={selectedTextElement.fontWeight}
                  onChange={(e) => updateTextElement(selectedTextElement.id, { fontWeight: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {/* Text Align */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Align</label>
                <div className="grid grid-cols-3 gap-1">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => updateTextElement(selectedTextElement.id, { textAlign: align })}
                      className={`px-2 py-1.5 rounded text-xs ${
                        selectedTextElement.textAlign === align
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Color</label>
                <input
                  type="color"
                  value={selectedTextElement.color}
                  onChange={(e) => updateTextElement(selectedTextElement.id, { color: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Width</label>
                  <input
                    type="number"
                    value={selectedTextElement.width}
                    onChange={(e) => updateTextElement(selectedTextElement.id, { width: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Height</label>
                  <input
                    type="number"
                    value={selectedTextElement.height}
                    onChange={(e) => updateTextElement(selectedTextElement.id, { height: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Position: ({Math.round(selectedTextElement.x)}, {Math.round(selectedTextElement.y)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
