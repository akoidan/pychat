terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.35.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloud_flare_api_token
}
