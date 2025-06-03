import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const createProfile = useMutation(api.profiles.createProfile);
  const checkUsername = useQuery(
    api.profiles.checkUsernameAvailable,
    username.length >= 3 ? { username } : "skip"
  );

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setIsChecking(true);
    
    // Reset availability when typing
    setIsAvailable(null);
  };

  // Update availability when check result changes
  if (checkUsername !== undefined && isChecking) {
    setIsAvailable(checkUsername);
    setIsChecking(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!isAvailable) {
      toast.error("Username is not available");
      return;
    }

    try {
      await createProfile({ username, bio: bio || undefined });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Profile
          </h1>
          <p className="text-gray-600">
            Choose a username to create your public trading page
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              minLength={3}
              required
            />
            {username.length >= 3 && (
              <div className="mt-2">
                {isChecking ? (
                  <p className="text-sm text-gray-500">Checking availability...</p>
                ) : isAvailable === true ? (
                  <p className="text-sm text-green-600">✓ Username is available</p>
                ) : isAvailable === false ? (
                  <p className="text-sm text-red-600">✗ Username is taken</p>
                ) : null}
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Your profile will be available at: /trade/{username}
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell other traders about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={!username || username.length < 3 || !isAvailable}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
