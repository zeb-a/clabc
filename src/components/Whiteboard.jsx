import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Pencil, Eraser, Type, Trash2, Download, X, Highlighter,
  Image as ImageIcon, Smile, Plus, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Load Twemoji from CDN for canvas rendering
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/npm/twemoji@15.0.3/';

export default function Whiteboard({ onClose }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [tool, setTool] = useState('pencil');
  const [lineWidth, setLineWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(30);
  const [highlighterWidth, setHighlighterWidth] = useState(20);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const inputRef = useRef(null);

  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Inter');

  const fontFamilies = [
    { name: 'Inter', label: 'Modern' },
    { name: 'Comic Sans MS', label: 'Fun' },
    { name: 'Georgia', label: 'Elegant' },
    { name: 'Courier New', label: 'Typewriter' },
    { name: 'Impact', label: 'Bold' },
  ];

  const emojis = [
    '⭐', '❤️', '👍', '👏', '🎉', '🔥', '✅', '❌',
    '😊', '😂', '🤔', '😍', '🎈', '🎁', '🏆', '🎯',
    '📚', '✏️', '🖍️', '🎨', '📐', '📏', '💡', '💯',
    '🌟', '🌈', '☀️', '🌙', '⭐', '💫', '✨', '🎪',
    '🏠', '🏫', '📐', '📏', '📝', '📎', '🔗', '📌',
    '✏️', '🖊️', '📌', '📎', '📏', '📐', '🎨', '🖌️'
  ];

  const quickColors = [
    '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#1e293b', '#ffffff'
  ];

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Parse emojis with Twemoji when emoji picker opens
  useEffect(() => {
    if (showEmojiPicker && typeof window !== 'undefined' && window.twemoji) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const emojiPicker = document.querySelector('[style*="position: fixed"][style*="z-index: 500"]');
        if (emojiPicker) {
          window.twemoji.parse(emojiPicker, {
            folder: 'svg',
            ext: '.svg',
            className: 'emoji'
          });
        }
      }, 50);
    }
  }, [showEmojiPicker]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const headerHeight = 70;
      const toolbarWidth = isMobile ? 0 : (showSettings ? 280 : 60);
      const bottomToolbarHeight = isMobile ? 80 : 0;
      const padding = 16;

      const availW = window.innerWidth - toolbarWidth - padding * 2;
      const availH = window.innerHeight - headerHeight - bottomToolbarHeight - padding * 2;

      canvas.width = availW * dpr;
      canvas.height = availH * dpr;
      canvas.style.width = `${availW}px`;
      canvas.style.height = `${availH}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, availW, availH);
      contextRef.current = ctx;
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [isMobile, showSettings]);

  const finalizeText = useCallback(() => {
    if (!textInput.visible || !textInput.value.trim()) {
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
      return;
    }

    const ctx = contextRef.current;
    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = 1.0;
    ctx.textBaseline = 'top';
    ctx.fillText(textInput.value, textInput.x, textInput.y);

    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  }, [textInput, color, fontSize, fontFamily]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ctx = contextRef.current;
        const maxWidth = canvasRef.current.width / window.devicePixelRatio * 0.8;
        const maxHeight = canvasRef.current.height / window.devicePixelRatio * 0.8;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height *= ratio;
        }
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width *= ratio;
        }

        const x = (canvasRef.current.width / window.devicePixelRatio - width) / 2;
        const y = (canvasRef.current.height / window.devicePixelRatio - height) / 2;

        ctx.drawImage(img, x, y, width, height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (textInput.visible) finalizeText();
    if (selectedEmoji) setSelectedEmoji(null);

    if (tool === 'text') {
      // Estimate text input width and adjust position if near right edge
      const estimatedWidth = Math.max(80, textInput.value.length * 12);
      const estimatedHeight = fontSize + 20;
      
      let adjustedX = x;
      let adjustedY = y;
      
      // Check if text input would overflow right edge
      if (x + estimatedWidth > rect.width) {
        adjustedX = x - estimatedWidth;
        // Ensure it doesn't go too far left
        if (adjustedX < 0) adjustedX = 0;
      }
      
      // Check if text input would overflow bottom edge
      if (y + estimatedHeight > rect.height) {
        adjustedY = y - estimatedHeight;
        // Ensure it doesn't go too far up
        if (adjustedY < 0) adjustedY = 0;
      }
      
      setTextInput({ visible: true, x: adjustedX, y: adjustedY, value: '' });
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    if (tool === 'emoji') {
      setSelectedEmoji({ x, y });
      setShowEmojiPicker(true);
      return;
    }

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? eraserWidth : (tool === 'highlighter' ? highlighterWidth : lineWidth);
    ctx.globalAlpha = tool === 'highlighter' ? 0.3 : 1.0;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = contextRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.globalAlpha = 1.0;
      setIsDrawing(false);
    }
  };

  const placeEmoji = (emoji) => {
    if (!selectedEmoji) return;

    const ctx = contextRef.current;
    const emojiSize = fontSize * 1.5;

    // Convert emoji to Twemoji code point
    const codePoints = Array.from(emoji).map(char => char.codePointAt(0).toString(16)).join('-');

    // Try to load Twemoji SVG image and draw it to canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, selectedEmoji.x, selectedEmoji.y, emojiSize, emojiSize);
    };
    // Fallback to text if Twemoji fails
    img.onerror = () => {
      ctx.font = `${emojiSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.globalAlpha = 1.0;
      ctx.fillText(emoji, selectedEmoji.x, selectedEmoji.y);
    };

    img.src = `${TWEMOJI_BASE}72x72/${codePoints}.png`;

    setSelectedEmoji(null);
    setShowEmojiPicker(false);
  };

  const saveImage = () => {
    finalizeText();
    setIsSaving(true);
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setTimeout(() => setIsSaving(false), 1500);
  };

  const clearCanvas = () => {
    const ctx = contextRef.current;
    const dpr = window.devicePixelRatio || 1;
    const width = canvasRef.current.width / dpr;
    const height = canvasRef.current.height / dpr;
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, width, height);
  };

  const getCurrentWidth = () => {
    if (tool === 'eraser') return eraserWidth;
    if (tool === 'highlighter') return highlighterWidth;
    return lineWidth;
  };

  return (
    <div style={styles.container}>
      <div className="safe-area-top" style={{ ...styles.header, paddingTop: 'calc(16px + var(--safe-top, 0px))' }}>
        <div style={styles.logo}>
          <Layers size={24} color="#6366f1" />
          <span style={styles.title}>Whiteboard</span>
        </div>
        <div style={styles.headerRight}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveImage}
            style={{...styles.actionBtn, background: isSaving ? '#10b981' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}}
          >
            {isSaving ? <Plus size={18} /> : <Download size={20} />}
            <span>{isSaving ? 'Saved!' : 'Save'}</span>
          </motion.button>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={28} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {textInput.visible && (
            <input
              ref={inputRef}
              style={{
                ...styles.liveInput,
                left: textInput.x,
                top: textInput.y,
                color,
                fontSize: `${fontSize}px`,
                fontFamily
              }}
              value={textInput.value}
              onChange={(e) => setTextInput({...textInput, value: e.target.value})}
              onBlur={finalizeText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  finalizeText();
                }
              }}
              placeholder="Type here..."
              autoFocus
            />
          )}
        </div>

        {/* Desktop Right Sidebar Toggle */}
        {!isMobile && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={styles.settingsToggle}
          >
            {showSettings ? <ChevronRight size={20} color="#6366f1" /> : <ChevronLeft size={20} color="#64748b" />}
          </button>
        )}

        {/* Desktop Right Sidebar */}
        {!isMobile && (
          <div style={{
            ...styles.rightSidebar,
            right: showSettings ? 0 : '-220px'
          }}>
            <div style={styles.sidebarContent}>
              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>Tools</div>
                <div style={styles.toolsGrid}>
                  <ToolBtn icon={Pencil} active={tool === 'pencil'} onClick={() => {finalizeText(); setTool('pencil');}} label="Pencil" />
                  <ToolBtn icon={Highlighter} active={tool === 'highlighter'} onClick={() => {finalizeText(); setTool('highlighter');}} label="Highlight" />
                  <ToolBtn icon={Type} active={tool === 'text'} onClick={() => setTool('text')} label="Text" />
                  <ToolBtn icon={Smile} active={tool === 'emoji'} onClick={() => {setTool('emoji'); setShowEmojiPicker(!showEmojiPicker);}} label="Emoji" />
                  <ToolBtn icon={ImageIcon} onClick={() => fileInputRef.current?.click()} label="Image" />
                  <ToolBtn icon={Eraser} active={tool === 'eraser'} onClick={() => {finalizeText(); setTool('eraser');}} label="Eraser" />
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>Colors</div>
                <div style={styles.colorGrid}>
                  {quickColors.map(c => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{...styles.colorOption, backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : 'none', boxShadow: color === c ? '0 0 0 2px #6366f1' : 'none'}}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{...styles.colorOption, padding: 0, cursor: 'pointer'}}
                  />
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>Size: {getCurrentWidth()}px</div>
                <input
                  type="range"
                  min={tool === 'eraser' ? 10 : (tool === 'highlighter' ? 10 : 1)}
                  max={tool === 'eraser' ? 80 : (tool === 'highlighter' ? 60 : 30)}
                  value={getCurrentWidth()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (tool === 'eraser') setEraserWidth(val);
                    else if (tool === 'highlighter') setHighlighterWidth(val);
                    else setLineWidth(val);
                  }}
                  style={styles.sizeSlider}
                />
              </div>

              {tool === 'text' && (
                <>
                  <div style={styles.divider} />
                  <div style={styles.sidebarSection}>
                    <div style={styles.sidebarTitle}>Text Settings</div>
                    <div style={{marginBottom: '12px'}}>
                      <div style={{fontSize: '11px', color: '#64748b', marginBottom: '6px'}}>Font Size: {fontSize}px</div>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={styles.sizeSlider}
                      />
                    </div>
                    <div>
                      <div style={{fontSize: '11px', color: '#64748b', marginBottom: '6px'}}>Font Family</div>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        style={styles.fontSelect}
                      >
                        {fontFamilies.map(f => (
                          <option key={f.name} value={f.name}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={styles.divider} />

              <button onClick={clearCanvas} style={styles.clearBtn}>
                <Trash2 size={20} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Toolbar */}
        {isMobile && (
          <div style={styles.mobileToolbar}>
            <div style={styles.mobileToolsRow}>
              <ToolBtn icon={Pencil} active={tool === 'pencil'} onClick={() => {finalizeText(); setTool('pencil');}} label="Pencil" />
              <ToolBtn icon={Highlighter} active={tool === 'highlighter'} onClick={() => {finalizeText(); setTool('highlighter');}} label="Highlight" />
              <ToolBtn icon={Type} active={tool === 'text'} onClick={() => setTool('text')} label="Text" />
              <ToolBtn icon={Smile} active={tool === 'emoji'} onClick={() => {setTool('emoji'); setShowEmojiPicker(!showEmojiPicker);}} label="Emoji" />
              <ToolBtn icon={ImageIcon} onClick={() => fileInputRef.current?.click()} label="Image" />
              <ToolBtn icon={Eraser} active={tool === 'eraser'} onClick={() => {finalizeText(); setTool('eraser');}} label="Eraser" />
            </div>
            <div style={styles.mobileSecondRow}>
              <div style={styles.mobileColors}>
                {quickColors.map(c => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{...styles.mobileColorOption, backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : 'none', boxShadow: color === c ? '0 0 0 2px #6366f1' : 'none'}}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{...styles.mobileColorOption, padding: 0, cursor: 'pointer'}}
                />
              </div>
              <div style={styles.mobileSizeControl}>
                <input
                  type="range"
                  min={tool === 'eraser' ? 10 : (tool === 'highlighter' ? 10 : 1)}
                  max={tool === 'eraser' ? 80 : (tool === 'highlighter' ? 60 : 30)}
                  value={getCurrentWidth()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (tool === 'eraser') setEraserWidth(val);
                    else if (tool === 'highlighter') setHighlighterWidth(val);
                    else setLineWidth(val);
                  }}
                  style={styles.mobileSizeSlider}
                />
              </div>
              <button onClick={clearCanvas} style={styles.mobileClearBtn}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div style={{...styles.emojiPicker, bottom: isMobile ? '100px' : '80px'}}>
          <div style={styles.emojiGrid}>
            {emojis.map(e => (
              <button
                key={e}
                onClick={() => placeEmoji(e)}
                style={styles.emojiBtn}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{display: 'none'}}
      />
    </div>
  );
}

const ToolBtn = ({ icon: Icon, active, onClick, label }) => (
  <div
    style={styles.toolBtnWrapper}
    onMouseEnter={(e) => {
      const tooltip = e.currentTarget.querySelector('.tooltip');
      if (tooltip) tooltip.style.opacity = '1';
    }}
    onMouseLeave={(e) => {
      const tooltip = e.currentTarget.querySelector('.tooltip');
      if (tooltip) tooltip.style.opacity = '0';
    }}
  >
    <button
      onClick={onClick}
      style={{
        ...styles.toolBtn,
        backgroundColor: active ? '#6366f1' : 'transparent',
        boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
      }}
    >
      <Icon size={22} color={active ? '#ffffff' : '#64748b'} />
    </button>
    <span className="tooltip" style={styles.tooltip}>{label}</span>
  </div>
);

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '70px',
    paddingBottom: '8px',
    paddingLeft: '24px',
    paddingRight: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    flexShrink: 0
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  title: {
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '-0.5px',
    fontSize: '20px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  closeBtn: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#64748b'
  },
  canvasContainer: {
    padding: '16px',
    position: 'relative',
    height: '100%'
  },
  canvas: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    display: 'block',
    cursor: 'crosshair',
    touchAction: 'none',
    width: '100%',
    height: '100%'
  },
  rightSidebar: {
    position: 'absolute',
    right: '-220px',
    top: 0,
    bottom: 0,
    width: '280px',
    background: 'white',
    borderLeft: '1px solid #e2e8f0',
    padding: '16px',
    overflowY: 'auto',
    transition: 'right 0.3s ease',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)'
  },
  settingsToggle: {
    position: 'absolute',
    right: 0,
    top: '20px',
    width: '40px',
    height: '48px',
    background: 'white',
    border: '2px solid rgba(99, 102, 241, 0.12)',
    borderRadius: '8px 0 0 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '-4px 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    zIndex: 1000
  },
  sidebarContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sidebarSection: {
    padding: '8px 0'
  },
  sidebarTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  toolBtnWrapper: {
    position: 'relative'
  },
  toolBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent'
  },
  tooltip: {
    position: 'absolute',
    top: '-35px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e293b',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '5px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px'
  },
  colorOption: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  sizeSlider: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: '#e2e8f0',
    appearance: 'none',
    cursor: 'pointer',
    accentColor: '#6366f1'
  },
  fontSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    background: 'white',
    cursor: 'pointer'
  },
  clearBtn: {
    background: '#fee2e2',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: '700',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  divider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '4px 0'
  },
  mobileToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid #e2e8f0',
    padding: '10px 12px',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 100
  },
  mobileToolsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '4px',
    marginBottom: '10px'
  },
  mobileSecondRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 10px'
  },
  mobileColors: {
    display: 'flex',
    gap: '6px',
    flex: 1,
    flexWrap: 'wrap'
  },
  mobileColorOption: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0
  },
  mobileSizeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  mobileSizeSlider: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    background: '#e2e8f0',
    appearance: 'none',
    cursor: 'pointer',
    accentColor: '#6366f1'
  },
  mobileClearBtn: {
    background: '#fee2e2',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0
  },
  emojiPicker: {
    position: 'fixed',
    background: 'white',
    padding: '16px',
    borderRadius: '20px',
    boxShadow: '0 10px 50px rgba(0, 0, 0, 0.25)',
    zIndex: 500,
    maxHeight: '350px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    right: '20px'
  },
  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '6px'
  },
  emojiBtn: {
    fontSize: '28px',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s'
  },
  liveInput: {
    position: 'absolute',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontWeight: 'bold',
    minWidth: '80px',
    maxWidth: '300px',
    padding: '4px 8px',
    borderBottom: '3px solid #6366f1',
    borderRadius: '4px',
    zIndex: 1000
  }
};
