
import React from 'react';

const Spinner: React.FC = () => (
    <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" role="status">
        <span className="sr-only">Loading...</span>
    </div>
);

export default Spinner;
