import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Search, Check, Download } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const AccessCodesPage = ({ activeClass, onBack }) => {
  const { isDark } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const filteredStudents = searchValue.trim()
    ? activeClass.students.filter(s => s.name.toLowerCase().includes(searchValue.trim().toLowerCase()))
    : activeClass.students;
  return (
    <div className="accesscodes-page safe-area-top" style={{ display: 'flex', flexDirection: 'column', background: isDark ? '#0F172A' : '#F7F8FA', minHeight: '100vh' }}>
      <style>{`
        .codes-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px 10px 24px;
          min-height: 44px;
          background: ${isDark ? '#1E293B' : '#fff'};
          border-bottom: 1px solid ${isDark ? '#334155' : '#E2E8F0'};
          position: sticky;
          top: 0;
          z-index: 10;
        }
        @media (max-width:768px) {
          .codes-header {
            padding: 0 8px 0 8px;
            min-height: 40px;
          }
          .codes-header-title.hidden {
            opacity: 0;
          }
        }
        .codes-header-title {
          position: absolute;
          left: 0;
          right: 0;
          text-align: center;
          pointer-events: none;
          font-size: 1.25rem;
          font-weight: 800;
          color: ${isDark ? '#F1F5F9' : '#222'};
          margin: 0;
          transition: opacity 0.2s ease;
        }
        .codes-header-inner {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .codes-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .codes-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin: 0 auto;
          max-width: 1200px;
          width: 100%;
          padding: 32px 12px 32px 12px;
        }
        @media (min-width: 700px) {
          .codes-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1020px) {
          .codes-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .codes-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${isDark ? '#1E293B' : '#fff'};
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.07);
          border: 1px solid ${isDark ? '#334155' : '#E2E8F0'};
          padding: 24px 12px 20px 12px;
          gap: 10px;
          margin: 0 auto;
          max-width: 370px;
        }
        .codes-name {
          font-weight: 800;
          color: ${isDark ? '#F1F5F9' : '#222'};
          font-size: 1.18rem;
          margin-bottom: 8px;
          text-align: center;
        }
        .codes-codes-row {
          display: flex;
          flex-direction: row;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        .codes-code-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 120px;
        }
        .codes-label {
          font-size: 0.98rem;
          font-weight: 700;
          color: ${isDark ? '#818CF8' : '#6366F1'};
          margin-bottom: 2px;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .codes-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 8px;
          border-radius: 16px;
          border: 2px solid #E2E8F0;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .codes-qr:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #6366F1;
        }
        .codes-code {
          font-family: 'Courier New', monospace;
          font-size: 1.15rem;
          background: ${isDark ? 'linear-gradient(135deg, #1e3a1e 0%, #2d4a2d 100%)' : 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%)'};
          color: ${isDark ? '#81C784' : '#2E7D32'};
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-align: center;
          border: 2px solid ${isDark ? '#4CAF50' : '#C8E6C9'};
          box-shadow: 0 2px 4px rgba(46, 125, 50, 0.1);
        }
        .codes-code.student {
          background: ${isDark ? 'linear-gradient(135deg, #1e2a3a 0%, #2d3a4a 100%)' : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'};
          color: ${isDark ? '#64B5F6' : '#1565C0'};
          border-color: ${isDark ? '#42A5F5' : '#90CAF9'};
          box-shadow: 0 2px 4px rgba(21, 101, 192, 0.1);
        }
        .codes-copy {
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid #b2dfdb;
          background: #fff;
          color: #2E7D32;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .codes-copy:hover {
          background: #E8F5E9;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(46, 125, 50, 0.15);
        }
        .codes-copy.copied {
          background: #4CAF50;
          border-color: #4CAF50;
          color: #fff;
        }
        .codes-copy.student {
          border: 1.5px solid #90caf9;
          color: #1565C0;
        }
        .codes-copy.student:hover {
          background: #E3F2FD;
          box-shadow: 0 4px 8px rgba(21, 101, 192, 0.15);
        }
        .codes-copy.student.copied {
          background: #2196F3;
          border-color: #2196F3;
          color: #fff;
        }
        @media (max-width:768px) {
          .codes-header {
            padding: 0 8px 0 8px;
          }
          .codes-list {
            max-width: 100%;
            padding: 10px 2px 18px 2px;
            gap: 14px;
          }
          .codes-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px 8px;
            gap: 12px;
          }
          .codes-info {
            min-width: 0;
          }
          .codes-codes-row {
            gap: 10px;
          }
        }
      `}</style>
      <div className="codes-header">
        <div className="codes-header-inner">
          <div style={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!searchOpen ? (
              <button
                aria-label="Search students"
                style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setSearchOpen(true)}
              >
                <Search size={22} />
              </button>
            ) : (
              <input
                autoFocus
                type="text"
                placeholder="Search students..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                style={{
                  fontSize: '1rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  outline: 'none',
                  width: '100%',
                  maxWidth: '200px',
                  transition: 'all 0.2s',
                  color: isDark ? '#F1F5F9' : '#222',
                  background: isDark ? '#1E293B' : '#F8FAFC',
                  marginLeft: 0
                }}
              />
            )}
          </div>
          <h2 className={`codes-header-title ${searchOpen ? 'hidden' : ''}`}>Access Codes</h2>
          <div className="codes-header-actions">
            <button 
              onClick={onBack} 
              style={{ background: isDark ? '#334155' : '#F1F5F9', color: isDark ? '#CBD5E1' : '#64748B', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#475569' : '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = isDark ? '#334155' : '#F1F5F9'}
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>
      <div className="codes-list">
        {filteredStudents.map((s) => {
          const codes = (activeClass.Access_Codes && activeClass.Access_Codes[s.id]) || { parentCode: '---', studentCode: '---' };
          const appBaseUrl = window.location.origin;
          const parentUrl = `${appBaseUrl}/#/parent-login/${codes.parentCode}`;
          const studentUrl = `${appBaseUrl}/#/student-login/${codes.studentCode}`;
          return (
            <div key={s.id} className="codes-card">
              <div className="codes-name">{s.name}</div>
              <div className="codes-codes-row">
                <div className="codes-code-block">
                  <div className="codes-label">Parent Code</div>
                  <span className="codes-code">{codes.parentCode}</span>
                  {codes.parentCode !== '---' && (
                    <div className="codes-qr">
                      <div style={{
                        padding: '4px',
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}>
                        <QRCode 
                          id={`parent-qr-${s.id}`} 
                          value={parentUrl} 
                          size={100} 
                          style={{ 
                            width: '100px', 
                            height: '100px'
                          }} 
                          level="H"
                          includeMargin={false}
                          bgColor="#FFFFFF"
                          fgColor="#2E7D32"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          className={`codes-copy ${copiedId === `parent-${s.id}` ? 'copied' : ''}`}
                          onClick={async () => {
                            const id = `parent-${s.id}`;
                            try {
                              await navigator.clipboard.writeText(codes.parentCode);
                              setCopiedId(id);
                              setTimeout(() => setCopiedId(null), 2000);
                            } catch {
                              alert('Failed to copy access code.');
                            }
                          }}
                          style={{ width: '90px' }}
                        >
                          {copiedId === `parent-${s.id}` ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              Copy
                            </>
                          )}
                        </button>
                      <button
                        className="codes-copy"
                          onClick={async () => {
                            const svg = document.getElementById(`parent-qr-${s.id}`);
                            if (svg) {
                              try {
                                const serializer = new XMLSerializer();
                                const svgString = serializer.serializeToString(svg);
                                const canvas = document.createElement('canvas');
                                
                                // --- UPDATED: Higher resolution and margins ---
                                const size = 512; // Much bigger size for high quality
                                const margin = 40; // White space around the QR
                                
                                canvas.width = size;
                                canvas.height = size;
                                const ctx = canvas.getContext('2d');
                                const img = new window.Image();
                                const svg64 = btoa(unescape(encodeURIComponent(svgString)));
                                const imageSrc = 'data:image/svg+xml;base64,' + svg64;
                                img.onload = function() {
                                  ctx.clearRect(0, 0, size, size);
                                  ctx.fillStyle = '#ffffff';
                                  ctx.fillRect(0, 0, size, size);
                                  
                                  // Draw image centered with margin
                                  ctx.drawImage(img, margin, margin, size - (margin * 2), size - (margin * 2));
                                  
                                  canvas.toBlob((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `parent-qr-${s.name}-${s.id}.png`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }, 'image/png');
                                };
                                img.onerror = function() {
                                  alert('Failed to render QR code image.');
                                };
                                img.src = imageSrc;
                              } catch (err) {
                                console.error('QR download error:', err);
                                alert('Failed to download QR code.');
                              }
                            }
                          }}
                          title="Download QR"
                          style={{ padding: '8px 10px' }}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="codes-code-block">
                  <div className="codes-label">Student Code</div>
                  <span className="codes-code student">{codes.studentCode}</span>
                  {codes.studentCode !== '---' && (
                    <div className="codes-qr">
                      <div style={{
                        padding: '4px',
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}>
                        <QRCode 
                          id={`student-qr-${s.id}`} 
                          value={studentUrl} 
                          size={100} 
                          style={{ 
                            width: '100px', 
                            height: '100px'
                          }} 
                          level="H"
                          includeMargin={false}
                          bgColor="#FFFFFF"
                          fgColor="#1565C0"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          className={`codes-copy student ${copiedId === `student-${s.id}` ? 'copied' : ''}`}
                          onClick={async () => {
                            const id = `student-${s.id}`;
                            try {
                              await navigator.clipboard.writeText(codes.studentCode);
                              setCopiedId(id);
                              setTimeout(() => setCopiedId(null), 2000);
                            } catch {
                              alert('Failed to copy access code.');
                            }
                          }}
                          style={{ width: '90px' }}
                        >
                          {copiedId === `student-${s.id}` ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          className="codes-copy student"
                          onClick={async () => {
                            const svg = document.getElementById(`student-qr-${s.id}`);
                            if (svg) {
                              try {
                                const serializer = new XMLSerializer();
                                const svgString = serializer.serializeToString(svg);
                                const canvas = document.createElement('canvas');
                                
                                // --- UPDATED: Higher resolution and margins ---
                                const size = 512; // Much bigger size
                                const margin = 40; // White space around the QR
                                
                                canvas.width = size;
                                canvas.height = size;
                                const ctx = canvas.getContext('2d');
                                const img = new window.Image();
                                const svg64 = btoa(unescape(encodeURIComponent(svgString)));
                                const imageSrc = 'data:image/svg+xml;base64,' + svg64;
                                img.onload = function() {
                                  ctx.clearRect(0, 0, size, size);
                                  ctx.fillStyle = '#ffffff';
                                  ctx.fillRect(0, 0, size, size);
                                  
                                  // Draw image centered with margin
                                  ctx.drawImage(img, margin, margin, size - (margin * 2), size - (margin * 2));
                                  
                                  canvas.toBlob((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `student-qr-${s.name}-${s.id}.png`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }, 'image/png');
                                };
                                img.onerror = function() {
                                  alert('Failed to render QR code image.');
                                };
                                img.src = imageSrc;
                              } catch (err) {
                                console.error('QR download error:', err);
                                alert('Failed to download QR code.');
                              }
                            }
                          }}
                        title="Download QR"
                        style={{ padding: '8px 10px' }}
                      >
                        <Download size={14} />
                      </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccessCodesPage;