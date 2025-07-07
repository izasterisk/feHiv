import React from 'react';

const CategoryList = ({ categories }) => {
  return (
    <div className="category-list">
      <h2 className="text-2xl font-bold mb-4">Danh mục</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div 
            key={category.category_id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-red-600">{category.category_name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 