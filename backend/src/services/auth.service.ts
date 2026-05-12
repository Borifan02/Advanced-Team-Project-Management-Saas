import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import { RolePermissions } from "../utils/role-permission";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import MemberModel from "../models/member.model";
import { ProviderEnum } from "../enums/account-provider.enum";

const isMongoTransactionNotSupported = (error: unknown): boolean => {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as any).message)
      : "";

  // Typical errors when connecting to a standalone MongoDB (no replica set)
  // or when transactions are not enabled.
  return (
    message.includes("Transaction numbers are only allowed") ||
    message.includes("replica set member") ||
    message.includes("Transaction is not supported") ||
    message.includes("IllegalOperation")
  );
};

const isMongoDuplicateKeyError = (error: unknown): boolean => {
  return Boolean(
    error &&
      typeof error === "object" &&
      ("code" in error && (error as any).code === 11000)
  );
};

const ensureDefaultRolesExist = async (session?: mongoose.ClientSession) => {
  const roleNames = Object.keys(RolePermissions) as Array<keyof typeof RolePermissions>;

  await Promise.all(
    roleNames.map((name) =>
      RoleModel.findOneAndUpdate(
        { name },
        {
          $setOnInsert: {
            name,
            permissions: RolePermissions[name],
          },
        },
        {
          new: true,
          upsert: true,
          ...(session ? { session } : {}),
        }
      )
    )
  );
};

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { providerId, provider, displayName, email, picture } = data;

  const run = async (session?: mongoose.ClientSession) => {
    await ensureDefaultRolesExist(session);

    let userQuery = UserModel.findOne({ email });
    if (session) userQuery = userQuery.session(session);
    let user = await userQuery;

    if (!user) {
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save(session ? { session } : undefined);

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save(session ? { session } : undefined);

      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save(session ? { session } : undefined);

      let ownerRoleQuery = RoleModel.findOne({ name: Roles.OWNER });
      if (session) ownerRoleQuery = ownerRoleQuery.session(session);
      const ownerRole = await ownerRoleQuery;

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save(session ? { session } : undefined);

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save(session ? { session } : undefined);
    }

    return { user };
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await run(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {
      // ignore
    }

    // Fallback for Mongo deployments that don't support transactions.
    if (isMongoTransactionNotSupported(error)) {
      return await run(undefined);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = body;

  const run = async (session?: mongoose.ClientSession) => {
    await ensureDefaultRolesExist(session);

    let existingUserQuery = UserModel.findOne({ email });
    if (session) existingUserQuery = existingUserQuery.session(session);
    const existingUser = await existingUserQuery;

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    // In case a previous request partially created an Account, also guard here.
    let existingAccountQuery = AccountModel.findOne({
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    if (session) existingAccountQuery = existingAccountQuery.session(session);
    const existingAccount = await existingAccountQuery;
    if (existingAccount) {
      throw new BadRequestException("Email already exists");
    }

    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save(session ? { session } : undefined);

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save(session ? { session } : undefined);

    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save(session ? { session } : undefined);

    let ownerRoleQuery = RoleModel.findOne({ name: Roles.OWNER });
    if (session) ownerRoleQuery = ownerRoleQuery.session(session);
    const ownerRole = await ownerRoleQuery;

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save(session ? { session } : undefined);

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save(session ? { session } : undefined);

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await run(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch {
      // ignore
    }

    if (isMongoDuplicateKeyError(error)) {
      throw new BadRequestException("Email already exists");
    }

    if (isMongoTransactionNotSupported(error)) {
      return await run(undefined);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId);

  if (!user) {
    throw new NotFoundException("User not found for the given account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user.omitPassword();
};
