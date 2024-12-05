"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Building, User, Search } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/dashboard/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/dashboard/dropdown-menu";
import mapboxgl from "mapbox-gl";

// Ensure the Mapbox access token is set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Menu items
const items = [
  { title: "Home", url: "#", icon: null },
  { title: "Inbox", url: "#", icon: null },
];

interface AppSidebarProps {
  flyToLocation: (lng: number, lat: number) => void;
}

export function AppSidebar({ flyToLocation }: AppSidebarProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(true);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions when searchText changes
  useEffect(() => {
    if (!shouldFetchSuggestions || !searchText) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const controller = new AbortController();
      const { signal } = controller;

      const fetchSuggestions = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              searchText
            )}.json?autocomplete=true&limit=5&access_token=${
              mapboxgl.accessToken
            }`,
            { signal }
          );

          const data = await response.json();

          if (data.features && data.features.length > 0) {
            setSuggestions(data.features);
            setErrorMessage("");
          } else {
            setSuggestions([]);
            setErrorMessage("No results found.");
          }
        } catch (error: any) {
          if (error.name === "AbortError") {
            // Fetch aborted
            return;
          }
          console.error("Error fetching suggestions:", error);
          setErrorMessage("An error occurred. Please try again later.");
        }
      };

      fetchSuggestions();

      // Cleanup function to abort fetch when component unmounts or searchText changes
      return () => controller.abort();
    }, 300);

    // Cleanup function to clear timeout when component unmounts or searchText changes
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchText, shouldFetchSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    setSearchText(suggestion.place_name);
    setSuggestions([]);
    setShouldFetchSuggestions(false); // Prevent fetching new suggestions

    const [lng, lat] = suggestion.center;
    flyToLocation(lng, lat);
  };

  // Handle manual search (when pressing Enter without selecting a suggestion)
  const handleSearch = async () => {
    if (!searchText) return;

    setShouldFetchSuggestions(false); // Prevent fetching suggestions during manual search

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText
        )}.json?access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const firstResult = data.features[0];
        const [lng, lat] = firstResult.center;

        flyToLocation(lng, lat);

        setErrorMessage("");
        setSuggestions([]);
      } else {
        setErrorMessage("City not found. Please try another city name.");
      }
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setShouldFetchSuggestions(true);
  };

  return (
    <Sidebar>
      {/* Header with Dropdown */}
      <SidebarHeader>
        <div className="flex items-center gap-2 p-4">
          <Building className="w-6 h-6" />
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex justify-between items-center w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">Acme Inc</span>
                    <span className="text-xs text-muted-foreground">
                      Enterprise
                    </span>
                  </div>
                  <ChevronDown className="ml-2" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <span>Acme Inc</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Acme Corp.</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Evil Corp.</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Add Team</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar content */}
      <SidebarContent>
        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <div className="flex items-center">
              <Search className="absolute left-3 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (suggestions.length > 0) {
                      handleSuggestionSelect(suggestions[0]);
                    } else {
                      handleSearch();
                    }
                  }
                }}
                placeholder="Search city"
                className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 border border-gray-300 rounded bg-white max-h-60 overflow-auto z-10">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Error Message */}
          {errorMessage && (
            <div className="mt-2 text-red-600">{errorMessage}</div>
          )}
        </div>

        {/* Existing Menu Items */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Dropdown */}
      <SidebarFooter>
        <div className="flex items-center gap-2 p-4">
          <User className="w-6 h-6" />
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex justify-between items-center w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">shadcn</span>
                    <span className="text-xs text-muted-foreground">
                      m@example.com
                    </span>
                  </div>
                  <ChevronDown className="ml-2" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <span>Upgrade to Pro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
