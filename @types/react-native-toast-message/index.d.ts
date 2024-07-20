declare module 'react-native-toast-message' {
    import { ComponentType } from 'react';
    import { ViewStyle, TextStyle } from 'react-native';
  
    export type ToastType = 'success' | 'error' | 'info';
  
    export interface ToastConfig {
      success?: ComponentType<any>;
      error?: ComponentType<any>;
      info?: ComponentType<any>;
      [key: string]: ComponentType<any> | undefined;
    }
  
    export interface ToastShowParams {
      type: ToastType;
      position?: 'top' | 'bottom';
      text1?: string;
      text2?: string;
      visibilityTime?: number;
      autoHide?: boolean;
      topOffset?: number;
      bottomOffset?: number;
      onShow?: () => void;
      onHide?: () => void;
      onPress?: () => void;
      props?: object;
    }
  
    export interface ToastConfigParams {
      success?: (internalState: any) => JSX.Element;
      error?: (internalState: any) => JSX.Element;
      info?: (internalState: any) => JSX.Element;
      [key: string]: ((internalState: any) => JSX.Element) | undefined;
    }
  
    export default class Toast {
      static show(options: ToastShowParams): void;
      static hide(): void;
      static setRef(ref: any): void;
      static config(config: ToastConfig): void;
    }
  }
  