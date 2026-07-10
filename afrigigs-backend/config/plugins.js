module.exports = ({ env }) => ({
  upload: {
    config: {
      // Swap to an S3-compatible provider for production; local provider
      // is fine for development only.
      provider: env('UPLOAD_PROVIDER', 'local'),
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024, // allow verification video uploads
      },
    },
  },
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['is_anonymous', 'country'],
      },
    },
  },
});
