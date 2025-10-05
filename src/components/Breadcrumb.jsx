import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400 mx-1">›</span>}
              {item.link ? (
                <Link 
                  to={item.link} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-primary-600 hover:bg-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb; 