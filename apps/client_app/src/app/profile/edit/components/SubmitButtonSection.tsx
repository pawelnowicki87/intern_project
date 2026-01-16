interface SubmitButtonSectionProps {
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SubmitButtonSection({ onSubmit, onCancel, loading }: SubmitButtonSectionProps) {
  return (
    <div className="px-4 md:px-8 py-6 flex gap-4">
      <button 
        onClick={onSubmit}
        disabled={loading}
        className="flex-1 md:flex-none md:px-12 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Submit'}
      </button>
      <button 
        onClick={onCancel}
        disabled={loading}
        className="flex-1 md:flex-none md:px-12 border border-gray-300 text-black py-2 rounded-lg font-semibold hover:bg-gray-50 hidden md:block disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  );
}