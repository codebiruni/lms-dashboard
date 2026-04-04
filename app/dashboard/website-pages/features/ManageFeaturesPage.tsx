'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import GETDATA from '@/app/default/functions/GetData';
import PATCHDATA from '@/app/default/functions/Patch';
import POSTDATA from '@/app/default/functions/Post';
import React, { useState, useEffect } from 'react';

// Types based on your schema
interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface FeatureSection {
  title: string;
  description: string;
  features: FeatureItem[];
}

interface Stats {
  title: string;
  value: string;
}

interface Testimonial {
  name: string;
  role: string;
  message: string;
}

interface BannerText {
  blackText: string;
  colorText: string;
}

interface FeaturesPageData {
  _id?: string;
  baseText: string;
  bannerText: BannerText;
  shortDescription: string;
  overviewTitle: string;
  overviewDescription: string;
  platformFeatures: FeatureSection[];
  instructorFeatures: FeatureSection[];
  studentFeatures: FeatureSection[];
  mobileAppFeatures: FeatureSection[];
  whyChooseUs: FeatureItem[];
  stats: Stats[];
  testimonials: Testimonial[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
}

export default function ManageFeaturesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeaturesPageData>({
    baseText: '',
    bannerText: {
      blackText: '',
      colorText: ''
    },
    shortDescription: '',
    overviewTitle: '',
    overviewDescription: '',
    platformFeatures: [],
    instructorFeatures: [],
    studentFeatures: [],
    mobileAppFeatures: [],
    whyChooseUs: [],
    stats: [],
    testimonials: [],
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: ''
  });

  // Fetch existing data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await GETDATA('/v1/featres-page');
      if (response?.data) {
        setFormData(response.data);
        if (response.data._id) {
          setPageId(response.data._id);
        }
      }
    } catch (error) {
      console.error('Error fetching features page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let response;
      
      if (pageId) {
        response = await PATCHDATA(`/v1/featres-page/${pageId}`, formData);
      } else {
        response = await POSTDATA('/v1/featres-page', formData);
      }
      
      if (response?.data) {
        if (response.data._id && !pageId) {
          setPageId(response.data._id);
        }
        alert('Features page saved successfully!');
      }
    } catch (error) {
      console.error('Error saving features page:', error);
      alert('Error saving features page');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for managing arrays
  const addToArray = (arrayName: keyof FeaturesPageData, newItem: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[]), newItem]
    }));
  };

  const updateInArray = (arrayName: keyof FeaturesPageData, index: number, updatedItem: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((item, i) => i === index ? updatedItem : item)
    }));
  };

  const removeFromArray = (arrayName: keyof FeaturesPageData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (arrayName: keyof FeaturesPageData, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleNestedArrayChange = (
    arrayName: keyof FeaturesPageData, 
    sectionIndex: number, 
    featureIndex: number, 
    field: string, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              features: section.features.map((feature: any, fIdx: number) =>
                fIdx === featureIndex ? { ...feature, [field]: value } : feature
              )
            }
          : section
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Features Page</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Text</label>
              <input
                type="text"
                value={formData.baseText}
                onChange={(e) => setFormData({ ...formData, baseText: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Banner Black Text</label>
                <input
                  type="text"
                  value={formData.bannerText.blackText}
                  onChange={(e) => setFormData({
                    ...formData,
                    bannerText: { ...formData.bannerText, blackText: e.target.value }
                  })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banner Color Text</label>
                <input
                  type="text"
                  value={formData.bannerText.colorText}
                  onChange={(e) => setFormData({
                    ...formData,
                    bannerText: { ...formData.bannerText, colorText: e.target.value }
                  })}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Overview Title</label>
              <input
                type="text"
                value={formData.overviewTitle}
                onChange={(e) => setFormData({ ...formData, overviewTitle: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Overview Description</label>
              <textarea
                value={formData.overviewDescription}
                onChange={(e) => setFormData({ ...formData, overviewDescription: e.target.value })}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Platform Features Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Platform Features</h2>
          {formData.platformFeatures.map((section, idx) => (
            <div key={idx} className="border-b pb-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => handleArrayChange('platformFeatures', idx, 'title', e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Section Description"
                  value={section.description}
                  onChange={(e) => handleArrayChange('platformFeatures', idx, 'description', e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              
              <div className="ml-4">
                <h3 className="font-medium mb-2">Features</h3>
                {section.features.map((feature, fIdx) => (
                  <div key={fIdx} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={feature.title}
                      onChange={(e) => handleNestedArrayChange('platformFeatures', idx, fIdx, 'title', e.target.value)}
                      className="border rounded p-1"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={feature.description}
                      onChange={(e) => handleNestedArrayChange('platformFeatures', idx, fIdx, 'description', e.target.value)}
                      className="border rounded p-1"
                    />
                    <input
                      type="text"
                      placeholder="Icon"
                      value={feature.icon}
                      onChange={(e) => handleNestedArrayChange('platformFeatures', idx, fIdx, 'icon', e.target.value)}
                      className="border rounded p-1"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const updatedSections = [...formData.platformFeatures];
                    updatedSections[idx].features.push({ title: '', description: '', icon: '' });
                    setFormData({ ...formData, platformFeatures: updatedSections });
                  }}
                  className="text-sm bg-green-500 text-white px-2 py-1 rounded"
                >
                  Add Feature
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addToArray('platformFeatures', { title: '', description: '', features: [] })}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Add Platform Feature Section
          </button>
        </div>

        {/* CTA Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Call to Action</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">CTA Title</label>
              <input
                type="text"
                value={formData.ctaTitle}
                onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CTA Description</label>
              <textarea
                value={formData.ctaDescription}
                onChange={(e) => setFormData({ ...formData, ctaDescription: e.target.value })}
                className="w-full border rounded p-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CTA Button Text</label>
              <input
                type="text"
                value={formData.ctaButtonText}
                onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        </div>

        {/* You can add similar sections for instructorFeatures, studentFeatures, etc. */}
      </div>
    </div>
  );
}