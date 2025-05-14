"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
    fetchGalleryItemsAction, 
    addGalleryItemAction, 
    updateGalleryItemAction, 
    deleteGalleryItemAction,
    updateGalleryOrderAction,
    type GalleryItem 
} from './actions';

export default function GalleryContentPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formState, setFormState] = useState<Partial<GalleryItem>>({ order: 0, altText: '', imageUrl: '', dataAiHint: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    setIsLoading(true);
    const items = await fetchGalleryItemsAction();
    setGalleryItems(items);
    setIsLoading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      // For now, we'll just use a placeholder. In a real app, upload this file.
      setFormState(prev => ({...prev, imageUrl: URL.createObjectURL(file)})); // Preview
       if (!formState.altText) {
            setFormState(prev => ({...prev, altText: file.name.split('.')[0].replace(/[-_]/g, ' ')}));
       }
        if (!formState.dataAiHint) {
            setFormState(prev => ({...prev, dataAiHint: file.name.split('.')[0].replace(/[-_]/g, ' ')}));
       }
    }
  };

  const handleFormChange = (field: keyof GalleryItem, value: string | number) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!formState.altText || !formState.dataAiHint || (!formState.imageUrl && !selectedFile)) {
        toast({variant: "destructive", title: "Validation Error", description: "Image (URL or Upload), Alt Text, and AI Hint are required."});
        setIsSaving(false);
        return;
    }
    
    let finalImageUrl = formState.imageUrl || '';
    // Placeholder: In a real app, upload `selectedFile` to Firebase Storage here
    // and get `finalImageUrl` from the upload response.
    if (selectedFile) {
        // Simulate upload and get a new URL
        finalImageUrl = `https://picsum.photos/seed/gallery-${Date.now()}/500/500`; // Placeholder
        toast({ title: "Info", description: "Image upload simulated. Using placeholder URL."});
    }

    const itemDataToSave = {
      order: typeof formState.order === 'number' ? formState.order : (galleryItems.length > 0 ? Math.max(...galleryItems.map(item => item.order)) + 1 : 1),
      imageUrl: finalImageUrl,
      altText: formState.altText!,
      caption: formState.caption,
      dataAiHint: formState.dataAiHint!,
    };

    let result;
    if (editingItem) {
      result = await updateGalleryItemAction({ ...itemDataToSave, id: editingItem.id });
    } else {
      result = await addGalleryItemAction(itemDataToSave);
    }
    setIsSaving(false);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      loadGalleryItems(); // Refresh list
      closeDialog();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message + (result.errors ? ` Details: ${result.errors.map(e => e.message).join(', ')}` : '')});
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    const nextOrder = galleryItems.length > 0 ? Math.max(...galleryItems.map(item => item.order)) + 1 : 1;
    setFormState({ order: nextOrder , altText: '', imageUrl: '', dataAiHint: ''});
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setFormState(item);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this item from the gallery?")) {
      setIsLoading(true); // Indicate general loading while deleting
      const result = await deleteGalleryItemAction(id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        loadGalleryItems(); // Refresh list
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
        setIsLoading(false);
      }
    }
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormState({ order: 0, altText: '', imageUrl: '', dataAiHint: '' });
    setSelectedFile(null);
     const fileInput = document.getElementById('gallery-image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = '';
  };

  // Placeholder for Drag and Drop End Handler
  const onDragEnd = async (result: any /* DropResult from react-beautiful-dnd */) => {
     if (!result.destination) return;

     const items = Array.from(galleryItems);
     const [reorderedItem] = items.splice(result.source.index, 1);
     items.splice(result.destination.index, 0, reorderedItem);

     const updatedItemsOrder = items.map((item, index) => ({ id: item.id, order: index + 1 }));
     
     setIsLoading(true);
     const updateResult = await updateGalleryOrderAction(updatedItemsOrder);
     if (updateResult.success && updateResult.item && Array.isArray(updateResult.item)) {
         setGalleryItems(updateResult.item); // Update state with newly ordered items from backend
         toast({title: "Success", description: "Gallery order updated."});
     } else {
         toast({variant: "destructive", title: "Error", description: updateResult.message || "Failed to update order."});
         // Optionally revert to previous order or refetch
         loadGalleryItems();
     }
     setIsLoading(false);
  };


  return (
    <div>
      <div className="px-4 py-6 space-y-6 bg-white rounded-lg border shadow-sm">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold">Manage Gallery Content</h3>
            <p className="text-sm text-gray-500">Add, edit, remove, and reorder images shown on the gallery page.</p>
          </div>
          <Button size="sm" onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Gallery Item
          </Button>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-4">Drag and drop items to reorder them (Drag & Drop functionality is a placeholder).</p>
          
          {isLoading && galleryItems.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="space-y-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="flex items-center p-4 gap-4 relative group bg-gray-50 rounded-lg border">
                  <span className="text-sm font-mono text-gray-500 w-6 text-center flex-shrink-0">{item.order}</span>
                  <div className="w-20 h-20 relative overflow-hidden bg-gray-200 rounded">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.altText} 
                      width={80} 
                      height={80} 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-grow space-y-1 text-sm overflow-hidden">
                    <p className="font-medium truncate">{item.altText}</p>
                    <p className="text-gray-500 truncate">
                      {item.caption ? item.caption : <span className="italic">No caption</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} disabled={isSaving}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} disabled={isSaving || isLoading}>
                      {isLoading && editingItem?.id !== item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500">No gallery items added yet.</p>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveItem} id="galleryItemForm" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-image-upload">Upload Image <span className="text-red-500">*</span></Label>
              <Input 
                id="gallery-image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={isSaving}
              />
              {formState.imageUrl && (
                <div className="mt-2">
                  <Image 
                    src={formState.imageUrl} 
                    alt="Preview" 
                    width={100} 
                    height={100}
                    className="rounded border" 
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gallery-image-url">Or Enter Image URL</Label>
              <Input 
                id="gallery-image-url" 
                type="url" 
                placeholder="https://..." 
                value={formState.imageUrl?.startsWith('blob:') ? '' : formState.imageUrl ?? ''} 
                onChange={(e) => { 
                  handleFormChange('imageUrl', e.target.value); 
                  setSelectedFile(null); 
                }} 
                disabled={!!selectedFile || isSaving} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gallery-alt-text">Alt Text <span className="text-red-500">*</span></Label>
              <Input 
                id="gallery-alt-text" 
                placeholder="Descriptive text for the image" 
                value={formState.altText ?? ''} 
                onChange={(e) => handleFormChange('altText', e.target.value)} 
                required 
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gallery-ai-hint">AI Hint <span className="text-red-500">*</span></Label>
              <Input 
                id="gallery-ai-hint" 
                placeholder="Keywords for placeholder (e.g., oak garage)" 
                value={formState.dataAiHint ?? ''} 
                onChange={(e) => handleFormChange('dataAiHint', e.target.value)} 
                required 
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gallery-caption">Caption (Optional)</Label>
              <Textarea 
                id="gallery-caption" 
                placeholder="Optional text to display with the image" 
                value={formState.caption ?? ''} 
                onChange={(e) => handleFormChange('caption', e.target.value)} 
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gallery-order">Order</Label>
              <Input 
                id="gallery-order" 
                type="number" 
                value={formState.order ?? 0} 
                onChange={(e) => handleFormChange('order', parseInt(e.target.value, 10))} 
                required 
                disabled={isSaving}
              />
            </div>
          </form>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="galleryItemForm" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
