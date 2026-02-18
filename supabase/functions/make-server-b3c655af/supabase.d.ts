declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

declare module "jsr:@supabase/supabase-js@2.49.8" {
  export function createClient(url: string | undefined, key: string | undefined): any;
}
