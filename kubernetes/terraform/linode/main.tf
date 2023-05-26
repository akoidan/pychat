terraform {
  required_providers {
    linode = {
      source = "linode/linode"
      version = "2.2.0"
    }
  }
}

provider "linode" {
  token = var.linode_token
}

resource "linode_lke_cluster" "pychat" {
    k8s_version = var.k8s_version
    label =  "pychat_1"
    region = var.region

    dynamic "pool" {
        for_each = var.pools
        content {
            type  = pool.value["type"]
            count = pool.value["count"]
        }
    }
}

data "linode_instances" "pychat_linode" {
  filter {
    name = "label"
    values = ["pychat_1"]
  }
}

