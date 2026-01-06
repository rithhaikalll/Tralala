import { supabase } from "./supabaseClient";

export const getOrCreateChat = async (
  type: "buddy" | "marketplace",
  currentUserId: string,
  otherUserId: string,
  otherUserName: string,
  itemId?: string, // Optional: Only for marketplace
  itemTitle?: string // Optional: Only for marketplace
) => {
  if (!currentUserId || !otherUserId) return null;

  try {
    // 1. Check if a chat already exists between these two users
    let query = supabase
      .from('chats')
      .select('*')
      .contains('participant_ids', [currentUserId, otherUserId])
      .eq('type', type);

    // If it's a marketplace chat, ensure it's about the specific Item
    if (type === 'marketplace' && itemId) {
      query = query.contains('metadata', { itemId: itemId });
    }

    const { data: existingChats, error } = await query;

    if (error) {
      console.error("Error finding chat:", error);
      return null;
    }

    // If found, return the existing chat
    if (existingChats && existingChats.length > 0) {
      return existingChats[0];
    }

    // 2. If NO chat exists, create a new one
    const newChatData = {
      type,
      participant_ids: [currentUserId, otherUserId],
      title: type === 'buddy' ? otherUserName : itemTitle, // Chat title
      last_message: "Chat started", // Initial text
      last_message_time: new Date().toISOString(),
      metadata: itemId ? { itemId } : {} // Store item ID for reference
    };

    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert(newChatData)
      .select()
      .single();

    if (createError) {
      console.error("Error creating chat:", createError);
      return null;
    }

    return newChat;

  } catch (err) {
    console.error("Chat Service Error:", err);
    return null;
  }
};