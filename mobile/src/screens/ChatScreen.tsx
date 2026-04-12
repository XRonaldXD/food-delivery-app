import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { chatApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';

export default function ChatScreen({ route }: { route: any }) {
  const { orderId } = route.params as { orderId: string };
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(orderId);
      setMessages(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(orderId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello! 👋</Text>}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
              {!isMine && (
                <Text style={styles.senderName}>{item.senderName} · {item.senderRole}</Text>
              )}
              <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.message}</Text>
              <Text style={[styles.time, isMine && styles.timeMine]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendBtnText}>{sending ? '⏳' : '➤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  bubbleOther: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  bubbleMine: { backgroundColor: '#FF6B35', alignSelf: 'flex-end' },
  senderName: { fontSize: 11, color: '#888', marginBottom: 3 },
  messageText: { fontSize: 15, color: '#222' },
  messageTextMine: { color: '#fff' },
  time: { fontSize: 10, color: '#aaa', marginTop: 4, textAlign: 'right' },
  timeMine: { color: 'rgba(255,255,255,0.7)' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  sendBtnText: { color: '#fff', fontSize: 18 },
});
