import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Music, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

// Spotify icon SVG
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

// Apple Music icon SVG
const AppleMusicIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.56-2.09-1.44-.305-.88-.01-1.86.74-2.423.445-.334.96-.474 1.502-.54.354-.043.71-.06 1.065-.08.238-.015.474-.043.704-.108.19-.053.326-.16.39-.35.022-.065.027-.134.027-.202V8.73c0-.163-.038-.264-.193-.305-.235-.06-.47-.107-.706-.157l-3.91-.818c-.34-.07-.68-.143-1.02-.214-.076-.016-.156-.017-.21.057-.037.052-.053.115-.053.18v7.363c0 .456-.043.906-.228 1.33-.278.64-.77 1.048-1.437 1.242-.345.1-.698.16-1.06.176-.892.04-1.694-.43-2.05-1.196a1.917 1.917 0 01.14-1.965c.38-.558.924-.862 1.56-.977.444-.08.893-.102 1.34-.138.262-.02.524-.03.78-.092.217-.053.378-.153.456-.374.024-.067.035-.14.035-.21V5.394c0-.17.012-.34.068-.504.096-.28.296-.45.583-.507.206-.04.414-.074.623-.106l4.36-.755c.444-.077.89-.152 1.334-.23.383-.066.766-.135 1.15-.2.074-.012.15-.014.208.04.046.046.067.11.067.18v5.8z"/>
  </svg>
);

interface ConnectionStatus {
  connected: boolean;
  displayName?: string;
  profileImageUrl?: string;
  isPremium?: boolean;
  country?: string;
  connectedAt?: string;
}

interface StreamingConnectionsProps {
  apiBaseUrl?: string;
}

export function StreamingConnections({ apiBaseUrl = '/api' }: StreamingConnectionsProps) {
  const [spotifyStatus, setSpotifyStatus] = useState<ConnectionStatus | null>(null);
  const [appleMusicStatus, setAppleMusicStatus] = useState<ConnectionStatus | null>(null);
  const [configured, setConfigured] = useState({ spotify: false, appleMusic: false });
  const [loading, setLoading] = useState(true);
  const [connectingSpotify, setConnectingSpotify] = useState(false);
  const [connectingAppleMusic, setConnectingAppleMusic] = useState(false);

  // Fetch connection statuses
  const fetchStatuses = async () => {
    try {
      console.log('[StreamingConnections] Fetching from:', `${apiBaseUrl}/streaming/connections`);
      const response = await fetch(`${apiBaseUrl}/streaming/connections`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('[StreamingConnections] Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch connection status');
      }

      const data = await response.json();
      console.log('[StreamingConnections] Response data:', data);
      console.log('[StreamingConnections] Configured:', data.configured);
      setSpotifyStatus(data.spotify);
      setAppleMusicStatus(data.appleMusic);
      setConfigured(data.configured);
    } catch (error) {
      console.error('[StreamingConnections] Error fetching streaming statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();

    // Check for OAuth callback results in URL params
    const params = new URLSearchParams(window.location.search);

    if (params.get('spotify_connected') === 'true') {
      toast.success('Spotify connected successfully!');
      // Clean up URL - remove OAuth params but keep clean URL
      window.history.replaceState({}, '', window.location.pathname);
      fetchStatuses();
    }

    if (params.get('spotify_error')) {
      const error = params.get('spotify_error');
      toast.error(`Spotify connection failed: ${error}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Clean up view param from URL after component mounts (OAuth redirect cleanup)
    if (params.get('view')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [apiBaseUrl]);

  const connectSpotify = () => {
    setConnectingSpotify(true);
    // Redirect to Spotify OAuth
    window.location.href = `${apiBaseUrl}/streaming/spotify/connect`;
  };

  const disconnectSpotify = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/streaming/spotify/disconnect`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSpotifyStatus({ connected: false });
        toast.success('Spotify disconnected');
      }
    } catch (error) {
      toast.error('Failed to disconnect Spotify');
    }
  };

  const connectAppleMusic = async () => {
    setConnectingAppleMusic(true);

    try {
      // Get developer token from backend
      const tokenResponse = await fetch(`${apiBaseUrl}/streaming/apple-music/developer-token`);
      if (!tokenResponse.ok) {
        throw new Error('Apple Music not configured');
      }

      const { developerToken } = await tokenResponse.json();

      // Initialize MusicKit (needs to be loaded in index.html)
      // @ts-ignore - MusicKit is loaded externally
      if (typeof MusicKit === 'undefined') {
        toast.error('Apple Music SDK not loaded. Please refresh the page.');
        setConnectingAppleMusic(false);
        return;
      }

      // @ts-ignore
      await MusicKit.configure({
        developerToken,
        app: {
          name: 'sedā.fm',
          build: '1.0.0',
        },
      });

      // @ts-ignore
      const music = MusicKit.getInstance();
      const musicUserToken = await music.authorize();

      // Save connection to backend
      const saveResponse = await fetch(`${apiBaseUrl}/streaming/apple-music/connect`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musicUserToken,
          displayName: music.me?.attributes?.name,
          country: music.storefrontCountryCode,
        }),
      });

      if (saveResponse.ok) {
        toast.success('Apple Music connected!');
        fetchStatuses();
      }
    } catch (error: any) {
      if (error.name === 'USER_CANCELLED') {
        toast.info('Apple Music authorization cancelled');
      } else {
        toast.error('Failed to connect Apple Music');
        console.error(error);
      }
    } finally {
      setConnectingAppleMusic(false);
    }
  };

  const disconnectAppleMusic = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/streaming/apple-music/disconnect`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setAppleMusicStatus({ connected: false });
        toast.success('Apple Music disconnected');
      }
    } catch (error) {
      toast.error('Failed to disconnect Apple Music');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Connect Your Music
        </h3>
        <p className="text-sm text-muted-foreground">
          Link your streaming accounts to play full tracks in sessions and crates.
          Your subscription stays with you - we just use it for playback.
        </p>
      </div>

      {/* Spotify */}
      <motion.div
        className={`p-4 rounded-lg border ${
          spotifyStatus?.connected
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-border bg-card'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              spotifyStatus?.connected ? 'bg-[#1DB954]' : 'bg-[#1DB954]/20'
            }`}>
              <SpotifyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Spotify</span>
                {spotifyStatus?.connected && (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              {spotifyStatus?.connected ? (
                <p className="text-sm text-muted-foreground">
                  {spotifyStatus.displayName}
                  {spotifyStatus.isPremium && (
                    <span className="ml-2 text-xs bg-[#1DB954]/20 text-[#1DB954] px-1.5 py-0.5 rounded">
                      Premium
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {configured.spotify
                    ? 'Connect for full track playback'
                    : 'Not configured'}
                </p>
              )}
            </div>
          </div>

          {configured.spotify && (
            spotifyStatus?.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectSpotify}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectSpotify}
                disabled={connectingSpotify}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
              >
                {connectingSpotify ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Connect
              </Button>
            )
          )}
        </div>
      </motion.div>

      {/* Apple Music */}
      <motion.div
        className={`p-4 rounded-lg border ${
          appleMusicStatus?.connected
            ? 'border-pink-500/30 bg-pink-500/5'
            : 'border-border bg-card'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              appleMusicStatus?.connected
                ? 'bg-gradient-to-br from-[#FA243C] to-[#D51F3A]'
                : 'bg-gradient-to-br from-[#FA243C]/20 to-[#D51F3A]/20'
            }`}>
              <AppleMusicIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Apple Music</span>
                {appleMusicStatus?.connected && (
                  <span className="flex items-center gap-1 text-xs text-pink-500">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              {appleMusicStatus?.connected ? (
                <p className="text-sm text-muted-foreground">
                  {appleMusicStatus.displayName || 'Apple Music subscriber'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {configured.appleMusic
                    ? 'Connect for full track playback'
                    : 'Not configured'}
                </p>
              )}
            </div>
          </div>

          {configured.appleMusic && (
            appleMusicStatus?.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectAppleMusic}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectAppleMusic}
                disabled={connectingAppleMusic}
                className="bg-gradient-to-r from-[#FA243C] to-[#D51F3A] hover:opacity-90 text-white"
              >
                {connectingAppleMusic ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Connect
              </Button>
            )
          )}
        </div>
      </motion.div>

      {/* Info note */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p>
          <strong>No subscription needed to browse.</strong> You can search and add tracks
          without connecting. Connect your account to play full tracks instead of previews.
        </p>
      </div>
    </div>
  );
}
