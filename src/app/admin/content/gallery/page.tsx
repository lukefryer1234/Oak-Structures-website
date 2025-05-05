
"use client"; // For state, dialogs, form handling

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Edit, Upload, GripVertical } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
// Placeholder for drag and drop library if needed (e.g., react-beautiful-dnd)
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// --- Types and Placeholder Data ---

interface GalleryItem {
  id: string;
  order: number; // For sorting
  imageUrl: string;
  altText: string;
  caption?: string; // Optional caption
  dataAiHint: string; // For placeholder generation
}

// Placeholder data - Fetch from backend, ordered by 'order'
const initialGalleryItems: GalleryItem[] = [
  { id: 'g1', order: 1, imageUrl: 'https://picsum.photos/seed/g1/500/500', altText: 'Completed double oak frame garage', caption: 'Spacious 2-bay garage with reclaimed oak finish.', dataAiHint: 'completed oak frame garage countryside' },
  { id: 'g2', order: 2, imageUrl: 'https://picsum.photos/seed/g2/500/500', altText: 'Oak frame gazebo in a garden setting', caption: 'Elegant 4x4m gazebo, perfect for outdoor entertaining.', dataAiHint: 'finished oak gazebo garden furniture' },
  { id: 'g3', order: 3, imageUrl: 'https://picsum.photos/seed/g3/500/500', altText: 'Welcoming oak frame porch on a brick house', caption: 'Custom designed porch adding character to the entrance.', dataAiHint: 'oak porch entrance house brick' },
   { id: 'g4', order: 4, imageUrl: 'https://picsum.photos/seed/g4/500/500', altText: 'Interior room with exposed oak beams', caption: 'Structural oak beams adding warmth and texture.', dataAiHint: 'exposed oak beams ceiling interior living room' },
];

export default function GalleryContentPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formState, setFormState] = useState<Partial<GalleryItem>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setFormState(prev => ({...prev, imageUrl: URL.createObjectURL(event.target.files[0])})); // Preview
       // Auto-fill alt text from filename (basic)
       if (!formState.altText) {
            setFormState(prev => ({...prev, altText: event.target.files[0].name.split('.')[0].replace(/[-_]/g, ' ')}));
       }
        if (!formState.dataAiHint) {
            setFormState(prev => ({...prev, dataAiHint: event.target.files[0].name.split('.')[0].replace(/[-_]/g, ' ')}));
       }
    }
  };


  const handleFormChange = (field: keyof GalleryItem, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveItem = async (event: React.FormEvent) => {
    event.preventDefault();
     if (!formState.altText || !formState.dataAiHint || (!formState.imageUrl && !selectedFile)) {
        alert("Please provide an Image (URL or Upload), Alt Text, and AI Hint."); // Use toast
        return;
    }

    let finalImageUrl = formState.imageUrl;

     // --- Placeholder File Upload Logic ---
     if (selectedFile) {
         console.log("Uploading gallery image:", selectedFile.name);
         await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
         finalImageUrl = `https://picsum.photos/seed/gallery-${Date.now()}/500/500`; // Placeholder URL
         console.log("Simulated upload complete. URL:", finalImageUrl);
     }
     // --- End Placeholder ---

    const newItemData: GalleryItem = {
      id: editingItem?.id ?? `g${Date.now()}`,
      order: editingItem?.order ?? (galleryItems.length > 0 ? Math.max(...galleryItems.map(item => item.order)) + 1 : 1),
      imageUrl: finalImageUrl!,
      altText: formState.altText!,
      caption: formState.caption,
      dataAiHint: formState.dataAiHint!,
    };

    if (editingItem) {
      setGalleryItems(prev => prev.map(item => item.id === editingItem.id ? newItemData : item).sort((a, b) => a.order - b.order));
       // TODO: API call to update item
      console.log("Updated Gallery Item:", newItemData);
    } else {
      setGalleryItems(prev => [...prev, newItemData].sort((a, b) => a.order - b.order));
       // TODO: API call to add item
      console.log("Added Gallery Item:", newItemData);
    }
    closeDialog();
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormState({});
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setFormState(item);
    setSelectedFile(null); // Clear file selection when editing existing
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to remove this item from the gallery?")) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
       // TODO: API call to delete item
      console.log("Deleted Gallery Item ID:", id);
      // Optional: Renumber 'order' if needed after deletion
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormState({});
    setSelectedFile(null);
     const fileInput = document.getElementById('gallery-image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = '';
  };

  // Placeholder for Drag and Drop End Handler
  const onDragEnd = (result: any /* Replace with actual type from dnd library */) => {
     if (!result.destination) return; // Dropped outside the list

     const items = Array.from(galleryItems);
     const [reorderedItem] = items.splice(result.source.index, 1);
     items.splice(result.destination.index, 0, reorderedItem);

     // Update order property based on new position
     const updatedItems = items.map((item, index) => ({ ...item, order: index + 1 }));

     setGalleryItems(updatedItems);
     // TODO: API call to update the order of items in the backend
     console.log("Reordered gallery items:", updatedItems.map(i => ({id: i.id, order: i.order})));
  };


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Manage Gallery Content</CardTitle>
          <CardDescription>Add, edit, remove, and reorder images shown on the gallery page.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button size="sm" onClick={openAddDialog}>
                   <PlusCircle className="mr-2 h-4 w-4" /> Add Gallery Item
                 </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleSaveItem} id="galleryItemForm" className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                     {/* Image Upload */}
                     <div className="space-y-2">
                         <Label htmlFor="gallery-image-upload">Upload Image <span className="text-destructive">*</span></Label>
                         <Input id="gallery-image-upload" type="file" accept="image/*" onChange={handleFileChange} className="pt-2"/>
                         {formState.imageUrl && !formState.imageUrl.startsWith('blob:') && <p className="text-xs text-muted-foreground">Current: {formState.imageUrl}</p>}
                         {(formState.imageUrl && formState.imageUrl.startsWith('blob:')) || (editingItem?.imageUrl && !selectedFile) && (
                            <div className="mt-2">
                                <Image src={formState.imageUrl || editingItem!.imageUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover aspect-square border" />
                            </div>
                         )}
                     </div>
                     {/* Or Image URL */}
                     <div className="space-y-2">
                        <Label htmlFor="gallery-image-url">Or Enter Image URL</Label>
                        <Input id="gallery-image-url" type="url" placeholder="https://..." value={formState.imageUrl?.startsWith('blob:') ? '' : formState.imageUrl ?? ''} onChange={(e) => { handleFormChange('imageUrl', e.target.value); setSelectedFile(null); }} disabled={!!selectedFile} />
                     </div>
                      {/* Alt Text */}
                      <div className="space-y-2">
                         <Label htmlFor="gallery-alt-text">Alt Text <span className="text-destructive">*</span></Label>
                         <Input id="gallery-alt-text" placeholder="Descriptive text for the image" value={formState.altText ?? ''} onChange={(e) => handleFormChange('altText', e.target.value)} required />
                      </div>
                     {/* AI Hint */}
                     <div className="space-y-2">
                       <Label htmlFor="gallery-ai-hint">AI Hint <span className="text-destructive">*</span></Label>
                       <Input id="gallery-ai-hint" placeholder="Keywords for placeholder (e.g., oak garage)" value={formState.dataAiHint ?? ''} onChange={(e) => handleFormChange('dataAiHint', e.target.value)} required />
                     </div>
                      {/* Caption */}
                      <div className="space-y-2">
                         <Label htmlFor="gallery-caption">Caption (Optional)</Label>
                         <Textarea id="gallery-caption" placeholder="Optional text to display with the image" value={formState.caption ?? ''} onChange={(e) => handleFormChange('caption', e.target.value)} />
                      </div>
                 </form>
                 <DialogFooter>
                     <DialogClose asChild><Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button></DialogClose>
                     <Button type="submit" form="galleryItemForm">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
         <p className="text-sm text-muted-foreground mb-4">Drag and drop items to reorder them (Drag & Drop functionality not fully implemented in this placeholder).</p>
        {/* --- Placeholder for Drag and Drop Context --- */}
        {/* <DragDropContext onDragEnd={onDragEnd}> */}
          {/* <Droppable droppableId="galleryItems"> */}
            {/* {(provided) => ( */}
              {/* <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4"> */}
                 {galleryItems.length > 0 ? (
                    galleryItems.map((item, index) => (
                         // <Draggable key={item.id} draggableId={item.id} index={index}>
                           // {(provided) => (
                              // <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                 <Card key={item.id} className="flex items-center p-4 gap-4 relative group">
                                      {/* <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 cursor-grab" /> */}
                                      <span className="text-sm font-mono text-muted-foreground w-6 text-center flex-shrink-0">{item.order}</span>
                                     <Image src={item.imageUrl} alt={item.altText} width={80} height={80} className="rounded-md object-cover aspect-square bg-muted flex-shrink-0" data-ai-hint={item.dataAiHint}/>
                                     <div className="flex-grow space-y-1 text-sm overflow-hidden">
                                         <p className="font-medium truncate" title={item.altText}>{item.altText}</p>
                                         <p className="text-muted-foreground truncate" title={item.caption}>{item.caption || <span className="italic">No caption</span>}</p>
                                         <p className="text-xs text-muted-foreground truncate" title={item.imageUrl}>{item.imageUrl}</p>
                                     </div>
                                      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}>
                                             <Edit className="h-4 w-4"/>
                                             <span className="sr-only">Edit</span>
                                         </Button>
                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                             <Trash2 className="h-4 w-4"/>
                                             <span className="sr-only">Delete</span>
                                         </Button>
                                     </div>
                                 </Card>
                              // </div>
                           // )}
                         // </Draggable>
                    ))
                  ) : (
                     <p className="text-muted-foreground text-center py-10">No gallery items added yet.</p>
                  )}
                 {/* {provided.placeholder} */}
              {/* </div> */}
             {/* )} */}
          {/* </Droppable> */}
        {/* </DragDropContext> */}
        {/* --- End Placeholder --- */}
      </CardContent>
    </Card>
  );
}
