resource "linode_lke_cluster" "pychat" {
  k8s_version = var.k8s_version
  label       = var.linode_app_label
  region      = var.region

  pool {
    #   https://github.com/linode/terraform-provider-linode/pull/569
    #    tags  = ["pychat_linode"]
    count = var.node_count
    type  = var.node_type
  }
}

data "linode_instances" "pychat_linode" {

  #  filter {
  #    name   = "tags"
  #    values = ["pychat_linode"]
  #  }
}
