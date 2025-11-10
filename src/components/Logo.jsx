export default function Logo({ className = "w-8 h-8 sm:w-10 sm:h-10" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Truck/Cab Body */}
      <rect x="8" y="18" width="20" height="12" rx="2" fill="white"/>
      {/* Windows */}
      <rect x="10" y="20" width="6" height="8" rx="1" fill="#22c55e"/>
      <rect x="18" y="20" width="6" height="8" rx="1" fill="#22c55e"/>
      {/* Wheels */}
      <circle cx="12" cy="32" r="3" fill="#1f2937"/>
      <circle cx="28" cy="32" r="3" fill="#1f2937"/>
      {/* Roof */}
      <rect x="6" y="16" width="24" height="2" rx="1" fill="white"/>
      {/* Cargo Area */}
      <rect x="28" y="20" width="4" height="6" rx="1" fill="white"/>
    </svg>
  )
}

