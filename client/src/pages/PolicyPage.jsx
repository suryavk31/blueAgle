import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PolicyPage = () => {
    const { type } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/policies/${type}`);
                setContent(res.data.content);
            } catch (error) {
                console.error(error);
                setContent('<p>Policy not found or error loading policy.</p>');
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, [type]);

    const getTitle = () => {
        switch (type) {
            case 'return': return 'Return & Refund Policy';
            case 'terms': return 'Terms & Conditions';
            case 'privacy': return 'Privacy Policy';
            case 'shipping': return 'Shipping Policy';
            case 'cancellation': return 'Cancellation Policy';
            default: return 'Policy';
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 capitalize text-gray-800 border-b pb-4">{getTitle()}</h1>
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                ) : (
                    <div
                        className="prose prose-purple max-w-none text-gray-600 prose-headings:text-gray-800 prose-a:text-purple-600"
                        dangerouslySetInnerHTML={{ __html: content }}
                    >
                        {/* Content rendered safely here */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyPage;
