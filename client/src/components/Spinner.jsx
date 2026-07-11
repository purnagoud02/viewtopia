export default function Spinner({ size = 36 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: '4px solid rgba(255,255,255,0.15)',
    borderTopColor: '#ff4d67',
    animation: 'spin 1s linear infinite',
    margin: 'auto',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={style} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
