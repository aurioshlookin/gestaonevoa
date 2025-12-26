import React, { createContext, useState, useEffect, useContext } from 'react';

// Definindo as configurações diretamente aqui para evitar erros de importação
const DISCORD_CONFIG = {
    CLIENT_ID: "1453817939265589452",
    GUILD_ID: "1410456333391761462"
};

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tenta pegar token da URL (após redirect do Discord)
        const f = new URLSearchParams(window.location.hash.slice(1)); 
        let accessToken = f.get('access_token');

        // Se não tem na URL, tenta pegar do armazenamento local
        if (!accessToken) {
            accessToken = localStorage.getItem('discord_access_token');
        } else {
            // Se veio da URL, salva e limpa a barra de endereço
            localStorage.setItem('discord_access_token', accessToken);
            window.history.pushState({}, document.title, window.location.pathname);
        }

        if (accessToken) { 
            setLoading(true);
            // 1. Busca dados do usuário
            fetch('https://discord.com/api/users/@me', {headers:{Authorization:`Bearer ${accessToken}`}})
            .then(r => {
                if (!r.ok) throw new Error("Token inválido");
                return r.json();
            })
            .then(userData => {
                // 2. Busca dados do membro no servidor (para pegar cargos)
                fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.GUILD_ID}/member`, {headers:{Authorization:`Bearer ${accessToken}`}})
                .then(r => r.ok ? r.json() : { roles: [] }) 
                .then(memberData => {
                    setUser({ ...userData, roles: memberData.roles || [] });
                    setLoading(false);
                });
            })
            .catch(err => {
                console.error("Sessão expirada:", err);
                localStorage.removeItem('discord_access_token'); 
                setUser(null);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = () => {
        const currentPath = window.location.origin + window.location.pathname;
        const redirectUri = encodeURIComponent(currentPath);
        // Redireciona para o OAuth2 do Discord
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=identify%20guilds.members.read`; 
    };

    const logout = () => {
        localStorage.removeItem('discord_access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
