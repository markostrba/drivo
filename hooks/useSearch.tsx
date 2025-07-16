import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { getFiles } from "@/lib/actions/file.action";
import { toast } from "sonner";
import { Models } from "appwrite";

interface UseFileSearchParams {
  ownerId: string;
  userEmail: string;
}

interface UseFileSearchReturn {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  results: Models.Document[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setResults: React.Dispatch<React.SetStateAction<Models.Document[]>>;
}

export function useSearch({
  ownerId,
  userEmail,
}: UseFileSearchParams): UseFileSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.Document[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchFiles = async () => {
      setIsLoading(true);

      const { error, data } = await getFiles({
        currentUserId: ownerId,
        currentUserEmail: userEmail,
        type: [],
        searchText: debouncedQuery,
      });

      if (error) {
        toast.error("Failed to load searched files", {
          description: error.message,
        });
        setResults([]);
        setIsOpen(false);
      } else if (data) {
        setResults(data.documents);
        setIsOpen(true);
      }
      setIsLoading(false);
    };

    fetchFiles();
  }, [debouncedQuery, ownerId, userEmail]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    setResults,
  };
}
