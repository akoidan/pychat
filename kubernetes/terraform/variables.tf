variable "cloud_flare_api_token" {
  description = "Go to https://dash.cloudflare.com/profile/api-tokens"
  validation {
    condition     = can(regex("^.+$", var.cloud_flare_api_token))
    error_message = "cloud_flare_api_token is required"
  }
  sensitive = true
}
variable "linode_token" {
  description = "K8s cluster provider. http://linode.com/ go to Profile -> Api tokens -> Create A Personal Access Token -> Select Kubernetes & Linodes -> Create Token."
  validation {
    condition     = can(regex("^.+$", var.linode_token))
    error_message = "linode_token is required"
  }
  sensitive = true
}
variable "cloud_flare_zone_id" {
  description = "Copy API Zone Id from https://dash.cloudflare.com/"
  validation {
    condition     = can(regex("^.+$", var.cloud_flare_zone_id))
    error_message = "cloud_flare_zone_id is required"
  }
  sensitive = true
}
variable "id_rsa" {
  description = "This ssh keypair will be used to authenticate in private git repo to make backups. Feel free to leave it empty if backups not used"
  default     = null
  sensitive   = true
}
variable "id_rsa_pub" {
  description = "This ssh keypair will be used to authenticate in private git repo to make backups. Feel free to leave it empty if backups not used"
  default     = null
}
variable "domain_name" {
  description = "Main domain address for chat"
  validation {
    condition     = can(regex("^.+$", var.domain_name))
    error_message = "domain_name is required"
  }
}
variable "email" {
  description = "Email that's used in certmanager. If use_certmanager is set to false, feel free to leave empty"
}
variable "linode_app_label" {
  default     = "pychat"
  description = "Linode k8s cluster name"
}
variable "github" {
  default     = null
  description = "git address for private backups. Url should be in ssh format e.g. git@github.com:username/backup_repo.git . Feel free to leave it empty if backups not used"
  validation {
    condition     = var.github == null || can(regex("^git@.*$", var.github))
    error_message = "Should start within git@, ssh only supported"
  }
}
variable "htpasswd" {
  description = "If this variable is set docker registry will be created with user and pass in this value. To generate use docker run --entrypoint htpasswd httpd:2 -Bbn user password"
  # "pychat:$2y$05$E79PTr6mfODQGVZxr6OOwOkhcGbBUX0gd5.LlSMYIhVX4TlQZ73jm"
  default   = null
  sensitive = true
}
variable "tls_crt" {
  default     = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZDekNDQXZPZ0F3SUJBZ0lKQVBVK29tczFoajJHTUEwR0NTcUdTSWIzRFFFQkJRVUFNQlF4RWpBUUJnTlYKQkFNTUNXeHZZMkZzYUc5emREQWVGdzB5TVRBeU1ERXhNVE14TWpaYUZ3MHpNVEF4TXpBeE1UTXhNalphTUJReApFakFRQmdOVkJBTU1DV3h2WTJGc2FHOXpkRENDQWlJd0RRWUpLb1pJaHZjTkFRRUJCUUFEZ2dJUEFEQ0NBZ29DCmdnSUJBTk1qVit3aUk5b1lFQ0krd3ZoOEhBMUxwTTM4WWFmK3k0bC91MnNiZWtLN211czhTTDJqVHlRd3UyT1kKYmgxUkJINlowVnlxV1pUWElQOXU3dEVsVWVkdmNjRzRLQjRRWExpSTk1T1hId3hlQ01ZejZtd0FQL1hsTjJVRQpwMUNLVDlTRUduK1ByTm1XQkFNejRvSmRsZFl1RkxjSVlOK1FITzg4aEZTbklvbUphc1RVNFhnZ3BOVmtxVmNuCjZrSjY4SU8yc1kzUDV2TStWZTdvSGRQcm8xbGtpbzYxQlNqNmJXdkRGQlpoRldUUktkUTBCT3hBZGIyWkIvaVkKSjluNXcwdUlkeHA5aVpPcVU5WGgzakdsU0ZOVFlZRlJCRFd0UVQ1NGV1VG5XSWxsaVpXaU5vRTQ3RHdqaHdvKwpFUGJnR0FDUFJSNmZzaDRPNEpOc0V3djZtRDgxT0dDWjZ2N0lFM3AzUUJFZGthNmo2UUd6a0VQbHBRdTZkMVF0CjVINFY4Mk5reGdrWkhsaWFMOSs1bXlGczNJMDVVZG45WUFEeXRUeUN6dnJzUU9GOXllVFhBZERTSWxIUVVyVmcKQTZGK053cjFCbU5oNGpJSDNrQ2tRMUJ4TElEblJpcTA3S0xPdTdpVHRQbmcvZ3R3ZUQ1Z09ZaEx0alBpZEEvbwpuUEJLMzJkSHlTRmRneVhHN1BPUDhzWEV5ZUdNWjFYeE9odTFSUERzTE1JTzhSY2Y3ZXlnU1NxbG94U0ZINS9vCjFHTGlRVWE1VUlyY1Y1Q2ZEQVAzUjkzbmV4cE9yaE11OERvZ0VCVFZnQVpVRG5pU0dncEJLTEdvaWZ3WVB4R2sKREUxZ3QyckF0eXdQd0Npc2s2T0s5dEJFaHNtUGs4ZVRiVm42bThBaHorMHhISVk3QWdNQkFBR2pZREJlTUM0RwpBMVVkSXdRbk1DV2hHS1FXTUJReEVqQVFCZ05WQkFNTUNXeHZZMkZzYUc5emRJSUpBUFUrb21zMWhqMkdNQWtHCkExVWRFd1FDTUFBd0N3WURWUjBQQkFRREFnVHdNQlFHQTFVZEVRUU5NQXVDQ1d4dlkyRnNhRzl6ZERBTkJna3EKaGtpRzl3MEJBUVVGQUFPQ0FnRUFWNEZyTkRaaWhCdWpIUWxNbHpGWDJ3MnNNaFFOWURFdnR1V3JwUmVUQ2p5cQoyL3M0ZHVqQnhlK1dkUW44T3p0OHF0cjRKanU2QWtDOTM4empqZW51Y253WWh3MEY1S0lkb2lrVzlMb1RGSGkvCjFFOW5KdW5TRGF2N1c1VnYwVTBOWHJrbnpyY0EvNE5tZHlUenJ4cEN4Nnlya0FzSFR2cGIraFhmbnN4UXY3a2IKa3hzOGR5SytPUmdiVjcvOTIwVUdlWk9oVFRrTnZhdFhpakpvRS9taGlBd0JuUmxkcDZhRHlzWVlNWDFXWGROWQplMXhEQlQ3b2k1UDl6NWlTSFE0cmRTOHJESkVON0VtdkF3MUhSV2F2a2UwQ0ROQ1BUOE5ndU5KOE9nczdSWlFBCk9ZeDBEcDZycmhSOU0xZzBUeTBubU9zUW1ucUE0U0Fwc3lyQ3JmZlFQWXVab3RDUmlvd05kNW1Pb2ZleXBicncKSUV1UHhpeVh2YTVjSi9XY0tQa1NtVDBqbjV5N1lYMVVoenI1UnUyODVPZS8yZ3FxTnlYNmUweEZidXo4UDl3SQoyL3lvRzV3VnVnYkN0TkNGTG1OQ0FSa3pGaHBmaEFxTmQ4Y3FnVjFQVFVBdUxGZmk5QTZVWlkwbDRUTklCbU4vClphY3RuYVF5SXZnT1FRL2ttVTNPb2M1ZGNxNGpldnI0RkFxWGxSaVNtSHJRWGtlekRyMllYUS9QckdhaG03LzgKM2NrMVoyZVdXWC8wby8yMzBMcU51QVdMeXZaWjExODg1ZHFUOUVnYlhxWWMzS3VNRGpueFVaQVFaMm5vNGdsUwpWdGR5NlRybnBLYTBMaGJEaDNENHF2OFVRTllOVlloelBaSEF6Zmo4a2c1WjNSU2V4MmI0ZWI1emdaendiczg9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
  description = "If use_certmanager is true this cert will be ignored, otherwise it will be used as tls certificate"
  sensitive   = true
}
variable "use_certmanager" {
  default = true
  type    = bool
}
variable "tls_key" {
  default     = "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS0FJQkFBS0NBZ0VBMHlOWDdDSWoyaGdRSWo3QytId2NEVXVremZ4aHAvN0xpWCs3YXh0NlFydWE2enhJCnZhTlBKREM3WTVodUhWRUVmcG5SWEtwWmxOY2cvMjd1MFNWUjUyOXh3YmdvSGhCY3VJajNrNWNmREY0SXhqUHEKYkFBLzllVTNaUVNuVUlwUDFJUWFmNCtzMlpZRUF6UGlnbDJWMWk0VXR3aGczNUFjN3p5RVZLY2lpWWxxeE5UaAplQ0NrMVdTcFZ5ZnFRbnJ3ZzdheGpjL204ejVWN3VnZDArdWpXV1NLanJVRktQcHRhOE1VRm1FVlpORXAxRFFFCjdFQjF2WmtIK0pnbjJmbkRTNGgzR24ySms2cFQxZUhlTWFWSVUxTmhnVkVFTmExQlBuaDY1T2RZaVdXSmxhSTIKZ1Rqc1BDT0hDajRROXVBWUFJOUZIcCt5SGc3Z2syd1RDL3FZUHpVNFlKbnEvc2dUZW5kQUVSMlJycVBwQWJPUQpRK1dsQzdwM1ZDM2tmaFh6WTJUR0NSa2VXSm92MzdtYklXemNqVGxSMmYxZ0FQSzFQSUxPK3V4QTRYM0o1TmNCCjBOSWlVZEJTdFdBRG9YNDNDdlVHWTJIaU1nZmVRS1JEVUhFc2dPZEdLclRzb3M2N3VKTzArZUQrQzNCNFBtQTUKaUV1Mk0rSjBEK2ljOEVyZlowZkpJVjJESmNiczg0L3l4Y1RKNFl4blZmRTZHN1ZFOE93c3dnN3hGeC90N0tCSgpLcVdqRklVZm4ralVZdUpCUnJsUWl0eFhrSjhNQS9kSDNlZDdHazZ1RXk3d09pQVFGTldBQmxRT2VKSWFDa0VvCnNhaUovQmcvRWFRTVRXQzNhc0MzTEEvQUtLeVRvNHIyMEVTR3lZK1R4NU50V2ZxYndDSFA3VEVjaGpzQ0F3RUEKQVFLQ0FnQVYyV3g1MVRhY2xTem1QbFJ5M25VUXN5bEUzNzlEWVV5eTEvTVBMSExFZ1NHUkFsWU11ZCt3d1JKRApSanp1NzdsbFdJbWY2MGtGN0JWUUdhekJHL21UMTZhUUEzeXpUOElvbnBQd1JBMUVmRjZ3RkNOSU5lWm9qZVhqCm9FMm9PZ2YwMkE3ZDhJSlVxZitVVFVROWRXM1NFa2EyZ2psMEtUZTFVaS9uaXJ3Nk8ydy9Ia0NPNitIaTYxM1MKMVNDYTdKb0RKMTdNYkIxY1FyRWwzZ05vTU5SZ3BkVG8yN2JDL05kaDlYZ1lzTWREL1prMGlvV1A1VVBKOFJJdwpHWjdXSWRDaCttZEk2SURhTlNBajNCSGdWVmhjdHg0NkFhWkwzN2dHdlBVS3h4NFVhZHVKRHBaUlhSQ2xVSS9pCjhYVlQ5dkRFN2c2YkVxK2VDTEFZMFhCUEp3bW1JTHVHeTMvd1FZdXZBblJKYnBJLzdBMjhaZUc3UUNUKytjQlkKN2tZZTZoMGNNYzJFK3ZNRm5lblcvbmE1S3dyVW52OCtvc2N5QWdWUjVPWS9xU3ZZWW5ZSG9zN1RWdVJLd1YxegpmYy9XMVhmUDBRSTk0MENSaktRT3hHamVCWHFDR2Y4K0ZYQlVKOE1Gd1QwT053WEppZG04b2I4SFZ2azJEdVRZCnlrL3BCZEM3a3pIcDVEUVhBWndOU0k4bWJLblRKbEVoc0RzRzlwQ1BaQkZRMGo3aGdmSkIvODZ6NzNuRHErVW0KSlVlR21QMWtTVUEzbk4wWkZZOGVVZWYxUUhGK2JXYk9IMDNMVERvbUJGVVMvM3RsNFVzYWtVenkrS0U2RW16WApCNTNrazE4NWd3UURlNStIeFExQ1NqbzJ4aUZBdVZWS0tUeFBzaCt5TWh5WnZWeVVrUUtDQVFFQTduVThsa2hLClhUalBzVGRWSXloR0RzWHJ2a1hQUWRuRyt1RDg0NUR0S0d3Z3lza2ZreGU0MkNYTWpRSUN6MGcxY0dnUlNDSkoKUEoyT1NQeEpxYnJWOVFEc1RWY284TFpOWlJrbEE2U1lSdnpYVU5XSjlHRlBZUmtRNGo1UmQ5d2N4aVh1TkRJQQpZKzlDZm9GN3ozcVQvUXQrL0VoRVM3Ymx4d3MwZmF1K29sYWlpcGsremNxMjlWdTFaWHB1Z3VmSlZEYVBVR3p0CkxvYk5FYmxNVjBpREwrRlNuUXRSM1RWaGtabWFnZW5VR2txZ0t3aEtDaWNLYTdHbGluU2ZsaHJBa2lVOFYwQ2sKNEhjYWlqTkx3ZUZQSm14MFZ1ZUhjUzR6Z21RK1ZPYmdFZjNHOXJESllFcFlYNmQ5bEtGcXBmU0YxQXI1ZklNaAo0ZU1lNE9yWUp1TDJId0tDQVFFQTRxdWF1anBPU3lZajNGVFdKR1grSCtobzhNR2VLb3FhZXpjZUN0OHZZWHh6CjhLcHhlRy9YWEppU3YxNTVoT1NiRG5LK2NKK2FobFNJS3l2N0NoS2hyaU9QVjlLOHpaUzR5Vzc3Tm14TWJuYnQKQmdkZWl1M0srZWRvWEZmTDdVcGVFaUNjV3IxeGF3NWl2eHVCaWNaNzZ5K0ErZlkxRFZiRGZ3Y0hZeEI1UEttaApveFhmdzRLUFhpd3l2a1ZZWlpVWkMybDR2aER1SlRqNGE2eTU1NjhVWmExN05Xc25JNCtneFNPbXBCUW8yRVZFClk2OUZGVm95NSsxSTN1TFR0SXdhcWt0QkR2TmFscjBOK3R1RFhTb3FodVR0akZ1NmdFYzVBazRnRWJ3YkMvNzgKUWs0Q3E3a0d0YXRTNW9sTWl0M05RcXNGM0JaWkVpMGE0YXE3SU1rVVpRS0NBUUIra09sc2xzZ3B2THE0UkRkRApKdUF3ZlNySVhrTkluMisydjI1YTF4U1pyUEttejZPYnJpNmxRMExUNFNwZW5PUUlXcVE1bGtFckZERnVXY0k3CmZYaU14MFdsTTByK29MUnBvYlA4d0FNM1FvS0NYQ1VSK2dobzhDWCsvN2E4R0srSkdKN2JRMkxqcUIyeUNjWU8KZFBCUmtpVi9nRmdIbS9kUDg0bVQzbkdidHNJbE1IdWVQU2RwQ1prNVdJZUpvYjlCbklmcTF6WDR5UUhWazNXSwpxbWsvSTZoMnhJaGFFamhNVUt3cW9sSzY5YnNYdkJtWVUrcDdDTnBscDhzQW9BaHdTYVZDWm9SY3c3cnBlWnFQCk9LaUxLMnVBcVBsQndKVUVjM0tHRzlqNGs2dGtTcWRJSFkzVWo1RGZMK0hzWGVJZWp3aW01dTgzOXhYdnFaYTYKNVNKZkFvSUJBQ0kzYjFydlZFUkoxSjM4L0hwd0h3Vm9DdmRVOHZCUERmVE5wQzVWOUl3TndsNnhEQUgzT0JaVgpQY20vbEM1NForT3RkSXdCdTh6TlUrVFlkY1BXZml1UVdLSVVRTVh6emxVeCtLQUZoeUFodWJQd1J0aEgveHpzClRyZXAxVEhUeVJHSmRMREo2aVlUL05vR1orNkpWTWx5MlZCaVZ5M1ZUQnVQenhDb092VHFVbWtROHo5TEpTTTkKSHNmVUpmem5uZWs0R2E3dlZWT3ZIdWo2SVBJVlhzbmVmenZZR2dkbk5naXNVZ3B3dEoyNUR4TFJNV2VBdnpCOQpoRU9KRUJZd0ZCSmkyOFpLL0FESE55WUlIdk5nV3gwVHo3d2hXS3ptazNlQ25acXZ2NUYzQTFOcS9VSTQ0d2RuCmZsTW9wTEpOdXg5Mk82TTJpR21TLzN6VFRmNHIvSFVDZ2dFQkFNTngxNnVtWUlLNVE0T3IyVXBDU3R5Nitsc2sKQ0RiMGhvTmJMT0svZFZWaW5wSWEzOUhveE9mWkFSSTNGR2MwRVVJZFBKTGgwL1FDQVdRaTM2MEFsYXAvOXltWApQcC9rU0pNalhtaElqcXk4Qy9XZDhkR1ptUlpyV3ZxODdlOTgySG9ZWGZxSzg3MXFrYnRGSkQ0WWI1aCtBR3I2CkM3eDJXQm0zT0IxaEl0cGhwNW9xZ3ozOGUxcTBOM0RPQkpMYTFFdEpqRmExUVVzRWpqckVqSWpnQWQvSlVIb1AKZHBrNHR0SmFzcndXQkROR1YyOWhONWhaT21JMEJxaHE5Tm9PZGZRZGtSTG9SQ3dtSWtSWkh3YXF2Q0F2a3NuLwpoclNoKzY2TG5qcThpMldIbS90a0JVeUE0Y0d1N2wrRzZFcEtDRWZ2THJxb3lZUlVia0FBaXQ2Q1VYaz0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0K"
  description = "If use_certmanager is true this cert will be ignored, otherwise it will be used as tls private key"
  sensitive   = true
}
variable "SECRET_KEY" {
  # bash download_content.sh generate_secret_key
  default     = "yC1-o_%kBSDMYsTloYHf4JxUrU&TQuQXf(-XwIPh%MeHE%T5vM"
  description = "Django secret key for password and etc"
  sensitive   = true
}
variable "RECAPTCHA_PRIVATE_KEY" {
  description = <<EOT
[OPTIONAL] Prevents spam with password guessing or email spoofing
If you want recaptcha: Open https://www.google.com/recaptcha/admin#list and register new domain, type is web captcha
If you set RECAPTCHA_PRIVATE_KEY you should set RECAPTCHA_PUBLIC_KEY in frontend/development.json and frontend/production.json
EOT
  sensitive   = true
}
variable "GOOGLE_OAUTH_2_CLIENT_ID" {
  description = "[OPTIONAL] For Google Oauth. https://developers.google.com/identity/sign-in/web/devconsole-project select webrowser"
  sensitive   = true
}
variable "FACEBOOK_ACCESS_TOKEN" {
  description = "[OPTIONAL] For FB Oauth. https://developers.facebook.com/apps/ -> click on app -> settings -> basic 'App ID|App Secret' e.g. FACEBOOK_ACCESS_TOKEN = '91237|bf86sd3'"
  sensitive   = true
}
variable "FIREBASE_API_KEY" {
  description = <<EOT
[OPTIONAL] For Notifications
 Pychat also supports https://developers.google.com/web/fundamentals/push-notifications/ firebase notifications, like in facebook.
 They will fire even user doesn't have opened tab. That can be turned on/off by used in his/her profile with checkbox `Notifications`.
 The implementation is similar like https://github.com/GoogleChrome/samples/tree/gh-pages/push-messaging-and-notifications.
    1. Create a project on the Firebase Developer Console: https://console.firebase.google.com/
    2. Go to Settings (the cog near the top left corner), click the Cloud Messaging Tab: https://console.firebase.google.com/u/1/project/pychat-org/settings/cloudmessaging/
    3. Put `<Your Cloud Messaging API Key ...>` to `FIREBASE_API_KEY` below.
    4. Create `chat/static/manifest.json` with content like https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/manifest.sample.json:

 {
  "name": "Pychat Push Notifications",
  "short_name": "PyPush",
  "start_url": "/",
  "display": "standalone",
  "gcm_sender_id": "<Your Sender ID from https://console.firebase.google.com>"
 }
EOT
  sensitive   = true
}
variable "DEFAULT_PROFILE_ID" {
  default     = "1"
  description = "Admin of main channel. First registered user"
  validation {
    condition     = can(regex("^\\d+$", var.DEFAULT_PROFILE_ID))
    error_message = "Only numbers"
  }
}
locals {
  docker_domain_name = var.htpasswd == null ? "" : "docker-registry.${var.domain_name}"
  static_domain_name = "static.${var.domain_name}"
}
