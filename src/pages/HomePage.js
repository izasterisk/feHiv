import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryList from '../components/HomePage/CategoryList';
import ArticleList from '../components/HomePage/ArticleList';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, articlesResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/Category/GetAll'),
          axios.get('http://localhost:8080/api/Article/GetAll')
        ]);

        setCategories(categoriesResponse.data);
        setArticles(articlesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Red Ribbon Life</h1>
        <p className="text-xl text-gray-600">
          Hỗ trợ và đồng hành cùng bệnh nhân HIV/AIDS
        </p>
      </div>

      <CategoryList categories={categories} />
      <ArticleList articles={articles} categories={categories} />
    </div>
  );
};

export default HomePage; 