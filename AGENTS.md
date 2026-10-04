<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Financial inputs (custo, reserva, guardado) live only in React state on /calculadora; never send them to any request, URL or storage — privacy promise of the product.
- WhatsApp number/message live only in src/config/flyup.ts — single place to change before publishing.
- Lead submission goes through the public server fn in src/lib/leads.functions.ts (honeypot + zod + phone normalization); shared schema in src/lib/lead-schema.ts so client and server validate identically.
- Admin is checked in the DB via has_role() in RLS; roles live only in user_roles, granted via SQL — never from the app.
- /admin is ssr:false and uses the browser client; RLS is the security boundary.
