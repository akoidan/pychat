resource "linode_lke_cluster" "pychat" {
  k8s_version = var.k8s_version
  label       = var.linode_app_label
  region      = var.region

  pool {
    #    tags  = ["pychat_linode"]
    count = var.node_count
    type  = var.node_type
  }
}

data "linode_instances" "pychat_linode" {
  depends_on = [linode_lke_cluster.pychat]
  # TODO this currently gets all nodes, even those which are not relevant to current cluster.
  # Unfortunately terraform linode_instances api, doesn't allow marking linode_lke_cluster pool by tags
  # Even though their REST api allow it
  # Check the PR https://github.com/linode/terraform-provider-linode/pull/569

  # Linode terraform API allows setting up via via load balancer, but it additionally costs 10$/month :(
  #  filter {
  #    name   = "tags"
  #    values = ["pychat_linode"]
  #  }
}
