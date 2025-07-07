import React from 'react';
import { format } from 'date-fns';

const ArticleList = ({ articles, categories }) => {
  // Hàm để lấy tên category từ category_id
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : '';
  };

  return (
    <div className="article-list mt-8">
      <h2 className="text-2xl font-bold mb-4">Bài viết mới nhất</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div 
            key={article.article_id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <span className="text-sm text-red-600 font-medium">
                {getCategoryName(article.category_id)}
              </span>
              <h3 className="text-xl font-semibold mt-2 mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.content}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  {format(new Date(article.createdDate), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleList; 