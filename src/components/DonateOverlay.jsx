import { Heart, X } from 'lucide-react';

const DonateOverlay = ({ showDonateOverlay, setShowDonateOverlay, isDark, isMobile }) => {
  if (!showDonateOverlay) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowDonateOverlay(false)}
      >
        <div
          style={{
            background: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: isMobile ? '420px' : '900px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowDonateOverlay(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#9ca3af' : '#6b7280',
              padding: '4px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
          >
            <X size={24} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Heart size={32} color="white" />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '800',
              color: isDark ? '#f9fafb' : '#111827'
            }}>
              Support Klasiz.fun
            </h2>
            <p style={{
              margin: '8px 0 0',
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: '14px'
            }}>
              Your donation helps us keep the app free for everyone!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
            {/* PayPal Option */}
            <a href="https://www.paypal.me/klasiz.fun" target="_blank" rel="noopener noreferrer" style={{
              padding: '16px',
              background: isDark ? '#374151' : '#f9fafb',
              borderRadius: '12px',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
              flex: isMobile ? 'none' : 1,
              textDecoration: 'none',
              display: 'block'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512">
                    <path d="M256.7,507.8C118.8,507.8,8,395.3,8.6,254.7C9.2,117.8,120,4.8,259.8,6.2   c137.1,1.4,247.2,114.4,245.7,253.5C504.1,396.1,394.6,507.6,256.7,507.8z M257.1,25.8C132.8,25.4,29.5,126.7,28.1,254.2   c-1.4,130.1,102.4,232.8,226.6,234c125.7,1.3,230.4-100.5,231.2-228.7C486.6,129.5,384.5,25.8,257.1,25.8z" fill="#042F8B"/>
                    <path d="M183.8,394.3c-21.3,0-42.6,0-64-0.1c-8.4,0-12.1-4.1-10.8-12.1c5.2-33.5,10.5-67.1,15.7-100.6   c5.1-32.4,10.1-64.8,15.3-97.1c4.4-27.8,8.9-55.6,13.5-83.4c1.5-8.9,7.7-13.8,16.8-13.8c36.6,0,73.3-0.4,109.9,0.1   c18.9,0.3,37.6,2.9,55.3,10.6c26.6,11.6,41.4,38.7,37.8,67.4c-0.4,2.9,0.3,6-1.4,8.7c-1-0.2-2-0.2-2.9-0.6   c-15-7.3-31.1-9.1-47.4-9.3c-29.5-0.4-59-0.1-88.5-0.1c-7.8,0-13.7,4.4-14.9,12c-1.9,12.7-4.1,25.5-6,38.2   c-2.9,19-6.2,37.8-8.9,56.8c-0.7,5.2-2.7,10.5-1.5,15.9c-0.7,2.2-1.7,4.2-2.1,6.6c-2,13.6-4.2,27.2-6.4,40.8   C190.2,354.3,187,374.3,183.8,394.3z" fill="#012D8A"/>
                    <path d="M183.8,394.3c3.2-20,6.4-40,9.6-59.9c2.2-13.6,4.4-27.2,6.4-40.8c0.4-2.4,1.4-4.4,2.1-6.6   c3.7-5.6,9-7.8,15.7-7.9c23.1-0.2,46.2,1.5,69-3.9c23.8-5.7,44.4-16.5,59.9-36c14.8-18.6,22.1-40.3,25.9-63.4   c18,8.9,26.8,24.3,28.4,43.3c2.2,25.2-3.7,49.3-16.3,71.2c-15.6,27.3-40.7,40.5-71,44.7c-10.3,1.4-20.8,2.1-31.2,1.9   c-8.4-0.2-13.2,4.2-14.5,12.6c-3.3,21.1-6.5,42.3-9.8,63.4c-2.1,13.6-3.6,20.8-23.3,20.1c-14.8-0.5-29.6-0.1-44.5-0.1   c-7.9,0-11.1-3.7-10.2-11.5C181,412.3,183.5,403.4,183.8,394.3z" fill="#019AE0"/>
                    <path d="M372.3,175.7c-3.7,23.1-11.1,44.8-25.9,63.4c-15.4,19.5-36.1,30.3-59.9,36c-22.8,5.5-46,3.7-69,3.9   c-6.7,0.1-12,2.3-15.7,7.9c-1.2-5.5,0.8-10.7,1.5-15.9c2.6-19,6-37.9,8.9-56.8c1.9-12.7,4.1-25.4,6-38.2c1.1-7.6,7-12,14.9-12   c29.5,0,59-0.3,88.5,0.1c16.2,0.2,32.4,2.1,47.4,9.3c0.9,0.4,1.9,0.4,2.9,0.6C372,174.6,372.2,175.1,372.3,175.7z" fill="#001F6B"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#111827' }}>PayPal</div>
                  <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Click to donate via PayPal</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '64px 16px 24px',
                background: 'white',
                borderRadius: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="186" height="50" viewBox="0 0 124 33">
                  <path fill="#253B80" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
                  <path fill="#179BD7" d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"/>
                  <path fill="#253B80" d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z"/>
                  <path fill="#179BD7" d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z"/>
                  <path fill="#222D65" d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z"/>
                  <path fill="#253B80" d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z"/>
                </svg>
              </div>
            </a>

            {/* WeChat QR Code */}
            <div style={{
              padding: '16px',
              background: isDark ? '#374151' : '#f9fafb',
              borderRadius: '12px',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
              flex: isMobile ? 'none' : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#07c160',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>微</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#111827' }}>WeChat Pay</div>
                  <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Scan QR code to donate</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
                background: 'white',
                borderRadius: '8px'
              }}>
                <img
                  src="/Wechat.png"
                  alt="WeChat Pay QR Code"
                  style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    objectPosition: 'center 40%'
                  }}
                />
              </div>
            </div>

            {/* Alipay QR Code */}
            <div style={{
              padding: '16px',
              background: isDark ? '#374151' : '#f9fafb',
              borderRadius: '12px',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
              flex: isMobile ? 'none' : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#1677ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>支</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#111827' }}>Alipay</div>
                  <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Scan QR code to donate</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
                background: 'white',
                borderRadius: '8px'
              }}>
                <img
                  src="/Alipay.png"
                  alt="Alipay QR Code"
                  style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    objectPosition: 'center 40%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonateOverlay;
