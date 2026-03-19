import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "userdata";

export interface UserDataFiles {
  cart: string;
  wishlist: string;
  preferences: string;
  orders: string;
  profile: string;
  session: string;
}

const getFilePath = (userId: string, fileName: keyof UserDataFiles): string => {
  return `${userId}/${fileName}.json`;
};

export const userDataStorage = {
  /**
   * Read JSON data from a user's file
   */
  async read<T>(userId: string, fileName: keyof UserDataFiles): Promise<T | null> {
    try {
      const path = getFilePath(userId, fileName);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(path);

      if (error) {
        // File doesn't exist yet
        if (error.message.includes("not found") || error.message.includes("Object not found")) {
          return null;
        }
        console.error(`Error reading ${fileName}:`, error);
        return null;
      }

      const text = await data.text();
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`Error parsing ${fileName}:`, err);
      return null;
    }
  },

  /**
   * Write JSON data to a user's file
   */
  async write<T>(userId: string, fileName: keyof UserDataFiles, data: T): Promise<boolean> {
    try {
      const path = getFilePath(userId, fileName);
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, jsonBlob, {
          upsert: true,
          contentType: "application/json",
        });

      if (error) {
        console.error(`Error writing ${fileName}:`, error);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Error writing ${fileName}:`, err);
      return false;
    }
  },

  /**
   * Delete a user's file
   */
  async delete(userId: string, fileName: keyof UserDataFiles): Promise<boolean> {
    try {
      const path = getFilePath(userId, fileName);
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error(`Error deleting ${fileName}:`, error);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Error deleting ${fileName}:`, err);
      return false;
    }
  },

  /**
   * List all files for a user
   */
  async listUserFiles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId);

      if (error) {
        console.error("Error listing files:", error);
        return [];
      }

      return data.map((file) => file.name);
    } catch (err) {
      console.error("Error listing files:", err);
      return [];
    }
  },

  /**
   * Get all user data at once
   */
  async getAllUserData(userId: string): Promise<{
    cart: unknown | null;
    wishlist: unknown | null;
    preferences: unknown | null;
    orders: unknown | null;
    profile: unknown | null;
    session: unknown | null;
  }> {
    const [cart, wishlist, preferences, orders, profile, session] = await Promise.all([
      this.read(userId, "cart"),
      this.read(userId, "wishlist"),
      this.read(userId, "preferences"),
      this.read(userId, "orders"),
      this.read(userId, "profile"),
      this.read(userId, "session"),
    ]);

    return { cart, wishlist, preferences, orders, profile, session };
  },
};
