// Lazy loading components for better code splitting
import { lazy } from 'react';

// Pages - todas exportam como default
export const BookDetails = lazy(() => import('@/pages/BookDetails'));
export const ChapterDetail = lazy(() => import('@/pages/ChapterDetail'));
export const EditChapter = lazy(() => import('@/pages/EditChapter'));
export const CreateBook = lazy(() => import('@/pages/CreateBook'));
export const Admin = lazy(() => import('@/pages/Admin'));
export const Profile = lazy(() => import('@/pages/Profile'));
export const Statistics = lazy(() => import('@/pages/Statistics'));
export const DocsOverview = lazy(() => import('@/pages/DocsOverview'));

// Heavy components - já exportam como default
export const AdminStats = lazy(() => import('@/components/Admin/AdminStats'));
export const BooksTable = lazy(() => import('@/components/Admin/BooksTable'));
export const UsersTable = lazy(() => import('@/components/Admin/UsersTable'));

// Outros componentes pesados - verificar exports
export const ExportPanel = lazy(() => import('@/components/Export/ExportPanel').then(module => ({ default: module.ExportPanel })));
export const AIPanel = lazy(() => import('@/components/AI/AIPanel').then(module => ({ default: module.AIPanel })));

// Rich text editor (heavy dependency)
export const BookElementEditor = lazy(() => import('@/components/Books/BookElementEditor').then(module => ({ default: module.BookElementEditor })));

// Image components (can be heavy with processing)
export const ImageEditor = lazy(() => import('@/components/Images/ImageEditor').then(module => ({ default: module.ImageEditor })));
export const ImageGallery = lazy(() => import('@/components/Images/ImageGallery').then(module => ({ default: module.ImageGallery })));
export const BookCoverUpload = lazy(() => import('@/components/Images/BookCoverUpload').then(module => ({ default: module.BookCoverUpload })));