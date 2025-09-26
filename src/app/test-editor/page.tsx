export default function TestEditor() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center py-8">
        Visual Editor Test Page
      </h1>
      <p className="text-center text-gray-600">
        This page is working! Now let's check the full editor.
      </p>
      <div className="flex justify-center mt-8">
        <a 
          href="/editor" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Full Editor
        </a>
      </div>
    </div>
  )
}
