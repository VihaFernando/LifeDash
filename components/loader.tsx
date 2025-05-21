export function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-teal-400 border-l-transparent animate-spin"></div>
        <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-teal-500 animate-spin animation-delay-150"></div>
      </div>
      <h2 className="mt-8 text-xl font-medium text-gray-700 dark:text-gray-300">Loading LifeDash...</h2>
    </div>
  )
}
