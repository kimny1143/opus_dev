    'use client';
    
    import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
    
    interface User {
      id: string;
      name: string;
      email: string;
      // 必要に応じて他のユーザー情報フィールドを追加
    }
    
    interface AuthContextProps {
      user: User | null;
      login: (email: string, password: string) => Promise<void>;
      logout: () => void;
      register: (name: string, email: string, password: string) => Promise<void>;
    }
    
    const AuthContext = createContext<AuthContextProps | undefined>(undefined);
    
    export const AuthProvider = ({ children }: { children: ReactNode }) => {
      const [user, setUser] = useState<User | null>(null);
    
      const login = async (email: string, password: string) => {
        try {
          // ここでログインAPIを呼び出し、ユーザー情報を取得
          // 例:
          // const response = await api.login(email, password);
          // setUser(response.user);
        } catch (error) {
          console.error('ログインに失敗しました:', error);
          // エラーハンドリングをここに追加
        }
      };
    
      const register = async (name: string, email: string, password: string) => {
        try {
          // ここで登録APIを呼び出し、ユーザー情報を取得
          // 例:
          // const response = await api.register(name, email, password);
          // setUser(response.user);
        } catch (error) {
          console.error('登録に失敗しました:', error);
          // エラーハンドリングをここに追加
        }
      };
    
      const logout = () => {
        // ここでログアウト処理を実行
        // 例:
        // api.logout();
        setUser(null);
      };
    
      useEffect(() => {
        const checkAuth = async () => {
          try {
            // 認証状態をチェックするAPIを呼び出し
            // 例:
            // const currentUser = await api.getCurrentUser();
            // setUser(currentUser);
          } catch (error) {
            console.error('認証状態のチェックに失敗しました:', error);
            // エラーハンドリングをここに追加
          }
        };
    
        checkAuth();
      }, []);
    
      return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
          {children}
        </AuthContext.Provider>
      );
    };
    
    export const useAuth = (): AuthContextProps => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth は AuthProvider 内で使用してください');
      }
      return context;
    };