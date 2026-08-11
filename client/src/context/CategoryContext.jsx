import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (error) {
            console.error('Error fetching categories in CategoryContext:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const getCategoryById = (id) => {
        if (!id) return null;
        return categories.find(c => c.id.toString() === id.toString()) || null;
    };

    const getSubCategoryById = (categoryId, subCategoryId) => {
        const cat = getCategoryById(categoryId);
        if (!cat || !cat.SubCategories) return null;
        return cat.SubCategories.find(s => s.id.toString() === subCategoryId.toString()) || null;
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                loading,
                fetchCategories,
                getCategoryById,
                getSubCategoryById,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};

export default CategoryContext;
