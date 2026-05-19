import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

import {
  articleGrid,
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  ghostBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
  pageWrapper,
  pageTitleClass,
  bodyText,
} from "../styles/common";

function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/articles`);
        if (res.status === 200) {
          setArticles(res.data.payload);
        }
      } catch (err) {
        console.error("[Home] Failed to fetch articles:", err);
        setError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, { state: article });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-[#f5f5f7] border-b border-[#e8e8ed] px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0066cc] mb-3">
          Blog
        </p>
        <h1 className={`${pageTitleClass} text-center`}>
          Latest Articles
        </h1>
        <p className={`${bodyText} mt-4 max-w-xl mx-auto`}>
          Thoughts, stories and ideas from our authors — published for everyone to read.
        </p>
      </div>

      {/* Articles */}
      <div className={pageWrapper}>
        {loading && (
          <p className={loadingClass}>Loading articles...</p>
        )}

        {!loading && error && (
          <p className={errorClass}>{error}</p>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className={emptyStateClass}>
            No articles published yet. Check back soon!
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className={articleGrid}>
            {articles.map((article) => (
              <div
                key={article._id}
                className={`${articleCardClass} rounded-2xl flex flex-col gap-3`}
                onClick={() => openArticle(article)}
              >
                {/* Category */}
                <p className={articleMeta}>{article.category}</p>

                {/* Title */}
                <p className={articleTitle}>{article.title}</p>

                {/* Excerpt */}
                <p className={articleExcerpt}>
                  {article.content?.slice(0, 100)}...
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="text-xs text-[#a1a1a6]">
                    {formatDate(article.createdAt)}
                  </span>
                  <button
                    className={ghostBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openArticle(article);
                    }}
                  >
                    Read →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;