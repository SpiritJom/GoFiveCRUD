using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserPermission2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_Users_UserId",
                table: "UserPermissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserPermissions",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserPermissions",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserPermissions",
                table: "UserPermissions",
                columns: new[] { "UserId", "PermissionId" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_Users_UserId",
                table: "UserPermissions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_Users_UserId",
                table: "UserPermissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserPermissions",
                table: "UserPermissions");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserPermissions",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserPermissions",
                table: "UserPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_Users_UserId",
                table: "UserPermissions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
