import type { UserConfig } from 'vite';
export type ViteConfig = Omit<UserConfig, 'root' | 'mode' | 'build'> & {
    root: string;
    mode: 'development' | 'production';
    build: {
        assetsDir: string;
        outDir: string;
    };
};
export default function resolveViteConfig(configFile: string): Promise<ViteConfig>;
