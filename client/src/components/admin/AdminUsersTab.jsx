import { useState } from "react";
import { Pagination } from "../ui/Pagination";
import {
  updateUserRoleRequest,
  updateUserCertificationRequest,
  updateUserCreditScoreRequest,
  banUserRequest,
  unbanUserRequest,
} from "../../api/admin.api";

export function AdminUsersTab({
  usersList,
  loadingUsers,
  usersPagination,
  usersPage,
  setUsersPage,
  loadUsers,
  onMessageUser,
  notify,
  confirm,
}) {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSort, setUserSort] = useState("name-asc");

  const filteredUsers = usersList
    .filter((usr) => {
      const searchLower = userSearch.toLowerCase();
      const matchesSearch =
        (usr.name || "").toLowerCase().includes(searchLower) ||
        (usr.email || "").toLowerCase().includes(searchLower);

      if (userRoleFilter === "all") return matchesSearch;
      return matchesSearch && usr.role === userRoleFilter;
    })
    .sort((a, b) => {
      if (userSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (userSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (userSort === "credit-desc") {
        return (b.creditScore ?? 0) - (a.creditScore ?? 0);
      }
      if (userSort === "credit-asc") {
        return (a.creditScore ?? 0) - (b.creditScore ?? 0);
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">👤 Buyers & Sellers Management</h2>
      <p className="text-xs text-gray-500 mb-4">
        Administrate user access permissions, modify credit ratings, and approve certification statuses.
      </p>

      {/* Search, Filter, and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Customer (Buyer)</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={userSort}
            onChange={(e) => setUserSort(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="credit-desc">Credit Score (High-Low)</option>
            <option value="credit-asc">Credit Score (Low-High)</option>
          </select>
        </div>
      </div>

      {loadingUsers ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading users list...</p>
      ) : filteredUsers.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Role</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Certification</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Credit Score</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {usr.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{usr.name || "Unknown User"}</span>
                    </div>
                  </td>
                  <td className="!py-3 !px-4 text-gray-600 text-xs whitespace-nowrap">{usr.email || "No Email"}</td>
                  <td className="!py-3 !px-4">
                    <select
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                      value={usr.role}
                      onChange={async (e) => {
                        try {
                          await updateUserRoleRequest(usr.id, e.target.value);
                          notify("User role updated.");
                          loadUsers(usersPage).catch(() => {});
                        } catch (err) {
                          notify(err.message || "Failed to update role.");
                        }
                      }}
                    >
                      <option value="user">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="!py-3 !px-4">
                    <select
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                      value={usr.certificationStatus}
                      onChange={async (e) => {
                        try {
                          await updateUserCertificationRequest(usr.id, e.target.value);
                          notify("Certification status updated.");
                          loadUsers(usersPage).catch(() => {});
                        } catch (err) {
                          notify(err.message || "Failed to update certification.");
                        }
                      }}
                    >
                      <option value="new">New</option>
                      <option value="certified">Certified</option>
                    </select>
                  </td>
                  <td className="!py-3 !px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#c4622d]"
                        defaultValue={usr.creditScore ?? 750}
                        onBlur={async (e) => {
                          const val = Number(e.target.value);
                          if (val !== usr.creditScore) {
                            try {
                              await updateUserCreditScoreRequest(usr.id, val);
                              notify("Credit score updated.");
                              loadUsers(usersPage).catch(() => {});
                            } catch (err) {
                              notify(err.message || "Failed to update credit score.");
                              e.target.value = usr.creditScore;
                            }
                          }
                        }}
                      />
                      <span className="text-[10px] text-gray-400 font-semibold">/1000</span>
                    </div>
                  </td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="button button-secondary text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                        onClick={() => onMessageUser(usr)}
                      >
                        ✉️ Message
                      </button>
                      {usr.role !== "admin" && (
                        usr.isBanned ? (
                          <button
                            type="button"
                            className="button text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer rounded-lg"
                            onClick={async () => {
                              try {
                                await unbanUserRequest(usr.id);
                                notify(`${usr.name || "User"} has been unbanned.`);
                                loadUsers(usersPage).catch(() => {});
                              } catch (err) {
                                notify(err.message || "Failed to unban user.");
                              }
                            }}
                          >
                            😇 Unban
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 cursor-pointer rounded-lg"
                            onClick={async () => {
                              if (await confirm(`Are you sure you want to ban ${usr.name || "this user"}? They won't be able to log in.`)) {
                                try {
                                  await banUserRequest(usr.id);
                                  notify(`${usr.name || "User"} has been banned.`);
                                  loadUsers(usersPage).catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to ban user.");
                                }
                              }
                            }}
                          >
                            🚫 Ban
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={usersPagination.currentPage}
            totalPages={usersPagination.totalPages}
            onPageChange={(p) => setUsersPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No users match your filters.
        </p>
      )}
    </div>
  );
}
