export default function CalculadoraAlquiler({
  theme = "light",
  backgroundColor = "ffffff",
  height = 600
}) {
  return (
    <div className="border-0 shadow-sm border rounded-4 overflow-hidden">

      <div className="card-body p-0">

<iframe
  title="Calculadora de alquileres"
  src={`https://arquiler.com/mini?theme=${theme}&backgroundColor=${backgroundColor}`}
  width="100%"
  height={height}
  scrolling="no"
  style={{
    border: "none",
    borderRadius: "1rem",
    display: "block",
    overflow: "hidden",
  }}
/>

      </div>

    </div>
  );
}