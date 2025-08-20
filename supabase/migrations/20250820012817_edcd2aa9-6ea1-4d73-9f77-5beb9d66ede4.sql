-- Create book_elements table for professional book components
CREATE TABLE public.book_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_elements ENABLE ROW LEVEL SECURITY;

-- Create policies for book_elements
CREATE POLICY "Book owners can view their book elements" 
ON public.book_elements 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.books 
  WHERE books.id = book_elements.book_id 
  AND books.owner_id = auth.uid()
));

CREATE POLICY "Book owners can create their book elements" 
ON public.book_elements 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.books 
  WHERE books.id = book_elements.book_id 
  AND books.owner_id = auth.uid()
));

CREATE POLICY "Book owners can update their book elements" 
ON public.book_elements 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.books 
  WHERE books.id = book_elements.book_id 
  AND books.owner_id = auth.uid()
));

CREATE POLICY "Book owners can delete their book elements" 
ON public.book_elements 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.books 
  WHERE books.id = book_elements.book_id 
  AND books.owner_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_book_elements_updated_at
BEFORE UPDATE ON public.book_elements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_book_elements_book_id ON public.book_elements(book_id);
CREATE INDEX idx_book_elements_order ON public.book_elements(book_id, order_index);